import { FastifyRequest, JWT } from 'fastify';
import { Roles } from '../../entities/Account';
import { checkAuthService, checkUserService } from './auth.services';
import { Account as User } from '../../entities/Account';

export const buildError = (statusCode: number, message: string): Error => {
  return new Error(JSON.stringify({ statusCode, message }));
}

export const genUniqNumber = (num = 6) => {
  const nums = new Set();
  while (nums.size !== num) {
    nums.add(Math.floor(Math.random() * 9) + 1);
  }

  return [...nums].join('');
}

export const checkAuthHook = (jwt: JWT, mustBeAuthenticated = true) => async (request: FastifyRequest, reply: any, done: any): Promise<User | undefined> => {
  try {
    const user = mustBeAuthenticated
      ? await checkAuthService(request.headers.authorization as string, jwt) as User
      : await checkUserService(request.headers.authorization as string, jwt) as User
    return request.user = user;
  } catch (error) {
    throw error;
  }
}
export const checkUserHook = (jwt: JWT) => async (request: FastifyRequest, reply: any, done: any): Promise<User> => {
  try {
    const user = await checkAuthService(request.headers.authorization as string, jwt);
    return request.user = user;
  } catch (error) {
    throw error;
  }
}
export const allowedFor = (roles: Array<Roles>) => async (request: FastifyRequest) => {
  const { role } = request.user as User;
  if (roles.includes(role)) {
    return request.user;
  } else {
    throw buildError(200, `Forbidden route only for ${roles.join(', ')}`);
  }
};