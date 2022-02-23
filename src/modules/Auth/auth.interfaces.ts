import { User } from '../../entities/User';
import { CommonResponse, JwtTokens } from '../../common/common.interfaces';

export interface LoginRequestBody {
  email: string;
  password: string;
  rememberMe: boolean;
}
export interface LoginServiceResponse extends JwtTokens {
  user: User;
}
export interface LoginUserResponse extends CommonResponse, JwtTokens {
  user: User;
}

export interface LogoutRequestBody {
  refreshToken: string;
}
export interface UpdateTokenRequestBody {
  refreshToken: string;
}

export interface LoginResponse extends CommonResponse, JwtTokens {}

export interface RegisterRequestBody {
  token: string;
  fullname: string;
  password: string;
}
export interface ForgotPasswordRequestBody {
  email: string;
}
export interface ConfirmRequestBody {
  token: string;
}
export interface RegisterRepositoryData {
  email: string;
  fullname: string;
  password: string;
};

export interface RegistrationResponse extends CommonResponse {
  user: User;
}

export interface RefreshTokenRequestBody {
  refreshToken: string;
}
export interface ResetPasswordRequestBody {
  forgotPasswordToken: string;
  password: string;
}

export type ResetPasswordData = ResetPasswordRequestBody;
