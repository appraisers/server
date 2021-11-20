import { EXPIRED } from './auth.constants';
import { JWT } from 'fastify';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getCustomRepository } from 'typeorm';
import {
  LoginRequestBody,
  RegisterRequestBody,
  JwtTokens,
  DecodedJWT,
  ConfirmRequestBody,
  LogoutRequestBody,
  ForgotPasswordRequestBody,
  ResetPasswordRequestBody,
} from './auth.interfaces';
import { buildError, genUniqNumber } from './auth.utils';
import { UserRepository, TokenRepository } from './auth.repositories';
import { allErrors } from './auth.messages';
import { sendEmail } from '../../utils/mail.helper';
import config from '../../config';
import { Account as User } from '../../entities/Account';
const { FRONTEND_URL } = config;

export const registerService = async (
  data: RegisterRequestBody
): Promise<null> => {
  const userRepo = getCustomRepository(UserRepository);
  const { firstName, lastName, email, phone, password } = data;
  const salt = bcrypt.genSaltSync(10);
  if (!email && !phone) throw buildError(400, allErrors.youMustFillTheEmailOrPhoneField);
  const emailConfirmationToken = email ? uuidv4() : null;
  // TODO phone confirm
  const phoneConfirmationToken = phone ? genUniqNumber() : null;
  const phoneConfirmed = true;

  const passwordHash = bcrypt.hashSync(password, salt);
  const user = await userRepo.createUser({
    ...data,
    password: passwordHash,
    emailConfirmationToken,
    phoneConfirmed,
    phoneConfirmationToken,
    emailConfirmed: false
  });
  await userRepo.createCart({ user });

  sendEmail({
    type: 'account-confirmation',
    emailTo: email,
    subject: 'Account confirmation'
  })
  return null;
};

export const forgotPasswordService = async (
  data: ForgotPasswordRequestBody
): Promise<null> => {
  const userRepo = getCustomRepository(UserRepository);
  const { email } = data;
  const user = await userRepo.findOne({ where: { email } });
  if (!user) throw buildError(400, allErrors.userIsNotFound);
  const forgotPasswordToken = uuidv4();
  user.forgotPasswordToken = forgotPasswordToken;
  await userRepo.save(user);
  sendEmail({
    type: 'forgot-password',
    emailTo: email,
    subject: 'Recovery password'
  })
  return null;
};

export const confirmService = async (
  data: ConfirmRequestBody
): Promise<null> => {
  const userRepo = getCustomRepository(UserRepository);
  const updateResult = await userRepo.confirm(data);
  if (!updateResult.affected) throw buildError(400, 'No such confirmation token');
  return null;
};

export const resetPasswordService = async (
  data: ResetPasswordRequestBody
): Promise<null> => {
  const userRepo = getCustomRepository(UserRepository);
  const updateResult = await userRepo.resetPassword(data);
  if (!updateResult.affected) throw buildError(400, 'No such confirmation token');
  return null;
};

export const loginService = async (
  data: LoginRequestBody,
  jwt: JWT
): Promise<JwtTokens> => {
  const { email, password, rememberMe } = data;

  const userRepo = getCustomRepository(UserRepository);
  const user = await userRepo.findOneWithPasswordByKey(
    'email',
    email
  );
  if (!user) throw buildError(400, allErrors.userIsNotFound);
  const compare = bcrypt.compareSync(password, user.password);
  if (!compare) throw buildError(400, allErrors.userIsNotFound);

  if (!user.emailConfirmed && !user.phoneConfirmed) throw buildError(400, allErrors.userIsNotConfirmed);
  const authToken = jwt.sign({ id: user.id }, { expiresIn: rememberMe ? EXPIRED.WITH_REMEMBER : EXPIRED.ACCESS });
  const refreshToken = jwt.sign(
    { id: user.id, isRefresh: true },
    { expiresIn: rememberMe ? EXPIRED.WITH_REMEMBER : EXPIRED.REFRESH }
  );

  const tokenRepo = getCustomRepository(TokenRepository);
  const refresh = await tokenRepo.createRefresh({ user: user, refreshToken });

  return {
    authToken,
    refreshToken,
  };
};

export const logoutService = async (
  data: LogoutRequestBody
) => {
  const tokenRepo = getCustomRepository(TokenRepository);
  const { refreshToken } = data;
  await tokenRepo.removeRefresh(refreshToken);
};


export const checkAuthService = async (
  token: string, //access
  jwt: JWT,
): Promise<User> => {
  const decoded: DecodedJWT = jwt.verify(token);
  if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);
  const userRepo = getCustomRepository(UserRepository);
  const user = await userRepo.findOneUserByKey('id', decoded.id);
  if (!user) throw buildError(400, allErrors.userIsNotFound);

  return user;
};
export const checkUserService = async (
  token: string, //access
  jwt: JWT,
): Promise<User | undefined> => {
  if (!token) return;
  const decoded: DecodedJWT | null = jwt.decode(token);
  if (!decoded || decoded.isRefresh) return;
  const userRepo = getCustomRepository(UserRepository);
  const user = await userRepo.findOneUserByKey('id', decoded.id);
  if (!user) return;
  return user;
};
export const checkUserEmail = async (
  email: string
): Promise<number | undefined> => {
  const userRepo = getCustomRepository(UserRepository);
  const user = await userRepo.findOneUserByKey('email', email);
  return user?.id;
}
export const getMediaForAccount = async (accountId: number): Promise<any> => {
  const userRepo = getCustomRepository(UserRepository);
  const media = await userRepo.getMediaForAccount(accountId);
  return media;
}
export const refreshTokenService = async (
  token: string, // refresh token
  jwt: JWT
): Promise<JwtTokens> => {
  const decoded: DecodedJWT = jwt.verify(token);
  if (!decoded.isRefresh) throw buildError(400, allErrors.incorectToken);

  const userRepo = getCustomRepository(UserRepository);
  const user = await userRepo.findOneUserByKey('id', decoded.id);
  if (!user) throw buildError(400, allErrors.userIsNotFound);

  const authToken = jwt.sign({ id: user.id }, { expiresIn: EXPIRED.ACCESS });
  const refreshToken = jwt.sign(
    { id: user.id, isRefresh: true },
    { expiresIn: EXPIRED.REFRESH }
  );
  return {
    authToken,
    refreshToken,
  };
};
