import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import {
  LoginResponse,
  LoginRequestBody,
  RegisterRequestBody,
  CheckAuthResponse,
  RefreshTokenRequestBody,
  ForgotPasswordRequestBody,
  ResetPasswordRequestBody,
  CommonResponse,
  RegistrationResponse,
} from './auth.interfaces';
import { allErrors } from './auth.messages';
import {
  loginSchema,
  registrationSchema,
  checkAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokensSchema,
} from './auth.schemas';
import {
  loginService,
  registrationService,
  refreshTokenService,
  checkAuthService,
  forgotPasswordService,
  // updateTokensService,
  resetPasswordService,
} from './auth.services';
import buildError from '../../utils/error.helper';

// eslint-disable-next-line @typescript-eslint/require-await
const routes = async (fastify: FastifyInstance): Promise<void> => {
  const commonResponse = {
    statusCode: 200,
    message: 'Success',
  };

  const forgotPasswordController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<CommonResponse> => {
    try {
      const { body } = request;
      await forgotPasswordService(body as ForgotPasswordRequestBody);
      return commonResponse;
    } catch (error) {
      console.log('registerController error', error.message);
      throw error;
    }
  };
  const resetPasswordController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      await resetPasswordService(request.body as ResetPasswordRequestBody);
      return commonResponse;
    } catch (error) {
      throw error;
    }
  };

  const loginController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<LoginResponse> => {
    const { body } = request;
    try {
      const tokens = await loginService(body as LoginRequestBody, fastify.jwt);
      return {
        ...commonResponse,
        ...tokens,
      };
    } catch (error: any) {
      console.log('logInHandler error', error.message);
      return error.message;
    }
  };

  const registrationController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<RegistrationResponse> => {
    try {
      const { body } = request;
      const user = await registrationService(body as RegisterRequestBody);
      return { ...commonResponse, user };
    } catch (error: any) {
      console.log('registration error', error.message);
      return error.message;
    }
  };

  const checkAuthController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<CheckAuthResponse> => {
    try {
      const {
        headers: { authorization },
      } = request;
      if (!authorization) throw buildError(400, 'Token is not found!');

      const user = await checkAuthService(authorization, fastify.jwt);

      return {
        ...commonResponse,
        user,
      };
    } catch (error) {
      if (error.message === allErrors.jwtExpires) {
        throw buildError(401, allErrors.jwtExpires);
      }
      throw error;
    }
  };

  const refreshTokenController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<LoginResponse> => {
    const { refreshToken } = request.body as RefreshTokenRequestBody;

    const newTokens = await refreshTokenService(refreshToken, fastify.jwt);
    return {
      ...newTokens,
      ...commonResponse,
    };
  };

  fastify.post('/login', loginSchema, loginController);
  fastify.post('/registration', registrationSchema, registrationController);
  fastify.post(
    '/forgot_password',
    forgotPasswordSchema,
    forgotPasswordController
  );
  fastify.get('/check', checkAuthSchema, checkAuthController);
  fastify.post('/refresh_tokens', refreshTokensSchema, refreshTokenController);
  fastify.post('/reset_password', resetPasswordSchema, resetPasswordController);
};

export default routes;
