import { User, Roles } from '../../entities/User';

export interface CommonResponse {
  statusCode: number;
  message: string;
  error?: string;
}
export interface LoginRequestBody {
  email: string;
  password: string;
  rememberMe: boolean;
}
export interface LogoutRequestBody {
  refreshToken: string;
}
export interface UpdateTokenRequestBody {
  refreshToken: string;
}
export interface JwtTokens {
  authToken: string;
  refreshToken: string;
}

export interface LoginResponse extends CommonResponse, JwtTokens { }

export interface RegisterRequestBody {
  email: string;
  workplace: string;
  fullname: string;
  password: string;
}
export interface ForgotPasswordRequestBody {
  email: string;
}
export interface ConfirmRequestBody {
  token: string;
}
export type RegisterRepositoryData = RegisterRequestBody;

export interface CheckAuthResponse extends CommonResponse {
  user: User;
}

export interface RegistrationResponse extends CommonResponse {
  user: User;
}

export interface DecodedJWT {
  id: number;
  iat: number;
  exp: number;
  isRefresh?: boolean;
}

export interface RefreshTokenRequestBody {
  refreshToken: string;
}
export interface ResetPasswordRequestBody {
  forgotPasswordToken: string;
  password: string;
}

