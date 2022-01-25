import { EntityRepository, Repository } from 'typeorm';
import { User } from '../../entities/User';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async findOneUserByKey<T extends keyof User>(
        key: T,
        val: string | number
      ): Promise<User  | undefined> {
        return this.findOne({ where: { [key]: val } });
    }
}