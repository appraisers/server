import { getCustomRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import base64 from 'base-64';
import { sendEmail } from '../../utils/mail.helper';
import { User } from '../../entities/User';
import { buildError } from '../../utils/error.helper';
import { allErrors } from '../../common/common.messages';
import { DecodedJWT, JWT, JwtTokens } from '../../common/common.interfaces';
import config from '../../config';
import {
  LoginRequestBody,
  LoginServiceResponse,
  RegisterRequestBody,
  LogoutRequestBody,
  ForgotPasswordRequestBody,
  ResetPasswordRequestBody,
} from './auth.interfaces';
import { EXPIRED } from './auth.constants';
import { UserRepository, TokenRepository } from './auth.repositories';

const { FRONTEND_URL } = config;

export const forgotPasswordService = async (
  data: ForgotPasswordRequestBody
): Promise<null> => {
  const userRepo = getCustomRepository(UserRepository);
  const { email } = data;
  const user = await userRepo.findOne({ where: { email } });
  if (!user) {
    throw buildError(400, allErrors.userNotFound);
  }
  const forgotPasswordToken = uuidv4();
  user.forgotPasswordToken = forgotPasswordToken;
  userRepo.save(user);
  sendEmail({
    type: 'forgot-password',
    emailTo: user.email,
    subject: 'Did you forget your password?',
    replacements: {
      link: `${FRONTEND_URL}/forgot_password_2/${forgotPasswordToken}`,
    },
  });
  return null;
};

export const resetPasswordService = async (
  data: ResetPasswordRequestBody
): Promise<null> => {
  const userRepo = getCustomRepository(UserRepository);
  const user = await userRepo.findOneUserByKey('forgotPasswordToken', data.forgotPasswordToken)
  if (!user) throw buildError(400, allErrors.userNotFound);

  const updateResult = await userRepo.resetPassword(data);
  if (!updateResult.affected) {
    throw buildError(400, allErrors.noSuchConfirmationToken);
  }
  sendEmail({
    type: 'successfully-change-password',
    emailTo: user.email,
    subject: 'Password successful changed',
  });
  return null;
};

export const checkAuthService = async (
  token: string,
  jwt: JWT
): Promise<User> => {
  const decoded: DecodedJWT = jwt.verify(token);
  if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);
  const userRepo = getCustomRepository(UserRepository);
  const user = await userRepo.findOneUserByKey('id', decoded.id);
  if (!user) throw buildError(400, allErrors.userNotFound);

  return user;
};

export const loginService = async (
  data: LoginRequestBody,
  jwt: JWT
): Promise<LoginServiceResponse> => {
  const { email, password, rememberMe } = data;
  const userRepo = getCustomRepository(UserRepository);
  const userCheck = await userRepo.findOneUserByKey('email', email);
  if (!userCheck) {
    throw buildError(400, allErrors.userNotFound);
  }
  if (userCheck.password !== password) {
    throw buildError(400, allErrors.userNotFound);
  }
  // const compare = bcrypt.compareSync(password, user.password);
  // if (!compare) throw buildError(400, allErrors.userNotFound);
  const authToken = jwt.sign(
    { id: userCheck.id },
    { expiresIn: rememberMe ? EXPIRED.WITH_REMEMBER : EXPIRED.ACCESS }
  );
  const refreshToken = jwt.sign(
    { id: userCheck.id, isRefresh: true },
    { expiresIn: rememberMe ? EXPIRED.WITH_REMEMBER : EXPIRED.REFRESH }
  )
  const tokenRepo = getCustomRepository(TokenRepository);
  await tokenRepo.createRefresh({ user: userCheck, refreshToken });
  if (userCheck.showInfo === false) {
    const user = await userRepo.userFewFieldsLogin(userCheck.id);
    if (!user) throw buildError(400, allErrors.userNotFound);
    return { user, authToken, refreshToken }
  }
  const user = userCheck;
  if (!user) throw buildError(400, allErrors.userNotFound);
  return {
    user,
    authToken,
    refreshToken,
  };
};

export const registrationService = async (
  data: RegisterRequestBody
): Promise<User> => {
  const userRepo = getCustomRepository(UserRepository);
  const { token, fullname, password } = data;
  const email = base64.decode(token);
  const isAlreadyUser = await userRepo.findOne({ where: { email } });
  if (isAlreadyUser) throw buildError(400, allErrors.userFound);
  const newUser = {
    email,
    fullname,
    password,
  };
  const newuser = await userRepo.createUser(newUser);
  const user = await userRepo.userFewFieldsRegistration(newuser.id);
  if (!user) throw buildError(400, allErrors.userFound);
  if (user) {
    sendEmail({
      type: 'successfully-registration',
      emailTo: email,
      subject: 'Registration successful',
    });
  }

  return user;
};

export const logoutService = async (data: LogoutRequestBody) => {
  const tokenRepo = getCustomRepository(TokenRepository);
  const { refreshToken } = data;
  await tokenRepo.removeRefresh(refreshToken);
};
export const checkUserEmail = async (
  email: string
): Promise<number | undefined> => {
  const userRepo = getCustomRepository(UserRepository);
  const user = await userRepo.findOneUserByKey('email', email);
  return user?.id;
};
export const refreshTokenService = async (
  token: string, // refresh token
  jwt: JWT
): Promise<JwtTokens> => {
  const decoded: DecodedJWT = jwt.verify(token);
  if (!decoded.isRefresh) throw buildError(400, allErrors.incorectToken);

  const userRepo = getCustomRepository(UserRepository);
  const user = await userRepo.findOneUserByKey('id', decoded.id);
  if (!user) throw buildError(400, allErrors.userNotFound);

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
