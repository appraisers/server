import { allErrors } from './auth.messages';
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import {
  LoginResponse,
  RegisterResponse,
  LoginRequestBody,
  RegisterRequestBody,
  CheckAuthResponse,
  RefreshTokenRequestBody,
  ForgotPasswordRequestBody,
  ResetPasswordRequestBody,
} from './auth.interfaces';
import {
  loginSchema,
  registerSchema,
  checkAuthSchema,
  confirmSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokensSchema,
} from './auth.schemas';
import {
  loginService,
  registerService,
  refreshTokenService,
  confirmService,
  checkAuthService,
  forgotPasswordService,
  getMediaForAccount,
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

  const registerController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<RegisterResponse> => {
    try {
      const { body } = request;
      await registerService(body as RegisterRequestBody);
      return commonResponse;
    } catch (error) {
      return {
        statusCode: 400,
        message: error.message,
      };
    }
  };
  const forgotPasswordController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<RegisterResponse> => {
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
  }

  const confirmController = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const { token } = request.params as { token: string };
      await confirmService({ token });
      return commonResponse;
    } catch (error) {
      throw error;
    }
  }

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
      let tmpMedia;
      if (user) tmpMedia = await getMediaForAccount(user.id);
      let newUser: any = { ...user };
      if (tmpMedia.medias.length > 0) newUser = { url: tmpMedia.medias[0].url, ...user };

      return {
        ...commonResponse,
        user: newUser,
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

  fastify.post('/register', registerSchema, registerController);
  fastify.post('/forgot_password', forgotPasswordSchema, forgotPasswordController);
  fastify.post('/confirm/:token', confirmSchema, confirmController);
  fastify.post('/login', loginSchema, loginController);
  fastify.get('/check', checkAuthSchema, checkAuthController);
  fastify.post('/refresh_tokens', refreshTokensSchema, refreshTokenController);
  fastify.post('/reset_password', resetPasswordSchema, resetPasswordController);
};

export default routes;
