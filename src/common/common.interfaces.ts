import * as jwt from 'jsonwebtoken';
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

//copied from node_modules
declare namespace JWTTypes {
  type SignPayloadType = object | string | Buffer;
  type VerifyPayloadType = object | string;
  type DecodePayloadType = object | string;

  interface SignCallback extends jwt.SignCallback { }

  interface VerifyCallback<Decoded extends VerifyPayloadType> extends jwt.VerifyCallback {
    (err: jwt.VerifyErrors, decoded: Decoded): void;
  }
}

export interface JWT {
  options: {
    decode: jwt.DecodeOptions;
    sign: jwt.SignOptions;
    verify: jwt.VerifyOptions;
  };
  secret: jwt.Secret;

  sign(payload: JWTTypes.SignPayloadType, options?: jwt.SignOptions): string;
  sign(payload: JWTTypes.SignPayloadType, callback: JWTTypes.SignCallback): void;
  sign(payload: JWTTypes.SignPayloadType, options: jwt.SignOptions, callback: JWTTypes.SignCallback): void;

  verify<Decoded extends JWTTypes.VerifyPayloadType>(token: string, options?: jwt.VerifyOptions): Decoded;
  verify<Decoded extends JWTTypes.VerifyPayloadType>(token: string, callback: JWTTypes.VerifyCallback<Decoded>): void;
  verify<Decoded extends JWTTypes.VerifyPayloadType>(
    token: string,
    options: jwt.VerifyOptions,
    callback: JWTTypes.VerifyCallback<Decoded>,
  ): void;

  decode<Decoded extends JWTTypes.DecodePayloadType>(token: string, options?: jwt.DecodeOptions): null | Decoded;
}