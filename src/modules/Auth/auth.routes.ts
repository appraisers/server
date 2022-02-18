import { FastifyRequest, FastifyInstance } from 'fastify';
import { commonResponse } from '../../common/common.constants';
import { CommonResponse } from '../../common/common.interfaces';
import { sendEmail } from '../../utils/mail.helper';
import {
  LoginResponse,
  LoginRequestBody,
  LoginUserResponse,
  RegisterRequestBody,
  RefreshTokenRequestBody,
  ForgotPasswordRequestBody,
  ResetPasswordRequestBody,
  RegistrationResponse,
} from './auth.interfaces';
import {
  loginSchema,
  registrationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokensSchema,
} from './auth.schemas';
import {
  loginService,
  registrationService,
  refreshTokenService,
  forgotPasswordService,
  resetPasswordService,
} from './auth.services';

const routes = async (fastify: FastifyInstance): Promise<void> => {
  const forgotPasswordController = async (
    request: FastifyRequest
  ): Promise<CommonResponse> => {
    try {
      await forgotPasswordService(request.body as ForgotPasswordRequestBody);
      return commonResponse;
    } catch (error) {
      throw error;
    }
  };

  const resetPasswordController = async (
    request: FastifyRequest
  ): Promise<CommonResponse> => {
    try {
      await resetPasswordService(request.body as ResetPasswordRequestBody);
      return commonResponse;
    } catch (error) {
      throw error;
    }
  };

  const loginController = async (
    request: FastifyRequest
  ): Promise<LoginUserResponse> => {
    const { body } = request;
    try {
      const responseLogin = await loginService(body as LoginRequestBody, fastify.jwt);
      
      return {
        ...commonResponse,
        ...responseLogin
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

  const emailController = async (): Promise<CommonResponse> => {
    try {
      sendEmail({
        type: 'forgot-password',
        emailTo: 'kirill-garnov@mail.ru',
        subject: 'Reset password',
      });
      return commonResponse;
    } catch (error) {
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
  fastify.get('/email', emailController);
  fastify.post('/refresh_tokens', refreshTokensSchema, refreshTokenController);
  fastify.post('/reset_password', resetPasswordSchema, resetPasswordController);
};

export default routes;
