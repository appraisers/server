export interface CommonResponse {
  statusCode: number;
  message: string;
  error?: string;
}

export interface DecodedJWT {
  id: ID;
  iat: number;
  exp: number;
  isRefresh?: boolean;
}

export interface JwtTokens {
  authToken: string;
  refreshToken: string;
}

export type ID = number;