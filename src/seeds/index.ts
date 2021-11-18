import { getRepository } from 'typeorm';

import accounts, { getAccounts } from './account';


const plant = async (seed: any) => {
  const { entity, data } = seed;
  const repo = getRepository(entity);
  const count = await repo.count();
  try {
    if (!count)
      // for (let i = 0; data[i+49]; i += 50) {
      //   const dataBunch = data.slice(i, i+50);
      //   await repo.save([...dataBunch]);

      //   if (!data[i+50+49]) {
      //     await repo.save([...data.slice(i+50)]);
      //   }
      // }
      await repo.save(data);
    console.info(`${entity.toString()} seeded`)
  } catch (error) {
    console.info('seed error = ', error);
  }
};

export const seedsPlugin = async (fastify: any, opts: any, done: any) => {
  fastify.decorate('utility', () => { });

  await plant(accounts);
  done();
};
