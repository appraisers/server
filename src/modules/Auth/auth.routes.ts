import { FastifyRequest, FastifyInstance } from 'fastify';
import { buildError } from '../../utils/error.helper';
import { commonResponse } from '../../common/common.constants';
import { CommonResponse } from '../../common/common.interfaces';
import {
  LoginResponse,
  LoginRequestBody,
  RegisterRequestBody,
  CheckAuthResponse,
  RefreshTokenRequestBody,
  ForgotPasswordRequestBody,
  ResetPasswordRequestBody,
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
  resetPasswordService,
} from './auth.services';

const routes = async (fastify: FastifyInstance): Promise<void> => {
  const forgotPasswordController = async (
    request: FastifyRequest
  ): Promise<CommonResponse> => {
    try {
      const { body } = request;
      await forgotPasswordService(body as ForgotPasswordRequestBody);
      return commonResponse;
    } catch (error) {
      throw error;
    }
  };
  const resetPasswordController = async (request: FastifyRequest) => {
    try {
      await resetPasswordService(request.body as ResetPasswordRequestBody);
      return commonResponse;
    } catch (error) {
      throw error;
    }
  };

  const loginController = async (
    request: FastifyRequest
  ): Promise<LoginResponse> => {
    const { body } = request;
    try {
      const tokens = await loginService(body as LoginRequestBody, fastify.jwt);
      return {
        ...commonResponse,
        ...tokens,
      };
    } catch (error) {
      throw error;
    }
  };

  const registrationController = async (
    request: FastifyRequest
  ): Promise<RegistrationResponse> => {
    try {
      const { body } = request;
      const user = await registrationService(body as RegisterRequestBody);
      return { ...commonResponse, user };
    } catch (error) {
      throw error;
    }
  };

  const checkAuthController = async (
    request: FastifyRequest
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
    } catch (error: any) {
      if (error.message === allErrors.jwtExpires) {
        throw buildError(401, allErrors.jwtExpires);
      }
      throw error;
    }
  };

  const refreshTokenController = async (
    request: FastifyRequest
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
