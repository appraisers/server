import { FastifyRequest } from 'fastify';
import path from 'path';
import fs from 'fs';
import util from 'util';
import { pipeline } from 'stream';
import config from '../config';
import { JWT } from '../common/common.interfaces';
import { Roles, User } from '../entities/User';
import { buildError } from '../utils/error.helper';
import { checkAuthService } from '../modules/Auth/auth.services';
const { PATH_TO_UPLOADS } = config;

const pump = util.promisify(pipeline);

export const randomInt = (min: number, max: number) => {
  const rand = min + Math.random() * (max - min + 1);
  return Math.round(rand);
};
export const genRandomPassword = (len: number) => {
  let password = '';
  const nums = '0123456789';
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const specialChars = '!@#$%^&*';
  const symbols = nums + alphabet + specialChars;

  password += alphabet.charAt(Math.floor(Math.random() * alphabet.length)); // start always from character
  for (let i = 0; i < len - 1; i++) {
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  }
  return password;
};

export const uploadFiles = async (media: Array<any>) => {
  if (media?.length) {
    for await (const file of media) {
      if (file.filename && file.mimetype !== 'text/plain') {
        // if file exists
        const fileName =
          path.join(__dirname, '..', '..', '..', PATH_TO_UPLOADS) +
          new Date().getTime() +
          '-' +
          file.filename;
        await pump(file.file, fs.createWriteStream(fileName));
      }
    }
  }
};

export const allowedFor = (roles: Array<Roles>) => async (
  request: FastifyRequest
) => {
  const { role } = request.user as User;
  
  if (roles.includes(role)) {
    return request.user;
  } else {
    throw buildError(400, `Forbidden route only for ${roles.join(', ')}`);
  }
};

export const checkAuthHook = (jwt: JWT) => async (
  request: FastifyRequest,
): Promise<User | undefined> => {
  try {
    const user = await checkAuthService(
      request.headers.authorization as string,
      jwt
    ) as User;

    return request.user = user;
  } catch (error) {
    throw error;
  }
};
