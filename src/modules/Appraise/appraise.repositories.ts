import { EntityRepository, Repository } from 'typeorm';
import { Appraise } from '../../entities/Appraise';
import { APPRAISE_LIMIT, APPRAISE_OFFSET } from './appraise.constants';
import {
  CreateAppraiseResponse,
  GetAppraisesUsersData,
  SetAppraiseStatusResponse,
} from './appraise.interfaces';
import { GetAppraiseResponse } from './appraise.interfaces';

@EntityRepository(Appraise)
export class AppraiseRepository extends Repository<Appraise> {
  async createAppraise(data: CreateAppraiseResponse): Promise<Appraise> {
    const { user, author } = data;
    const appraise = new Appraise();
    appraise.user = user;
    appraise.author = author;
    await this.save(appraise);
    return appraise;
  }
  async setAppraiseStatus(data: SetAppraiseStatusResponse) {
    const { userId, authorId } = data;
    return this.createQueryBuilder('appraise')
      .update(Appraise)
      .set({ status: true })
      .where('user_id = :userId', { userId })
      .andWhere('author_id = :authorId', { authorId })
      .execute();
  }
  async findAppraises(data: GetAppraiseResponse): Promise<Appraise[]> {
    const {
      userId,
      authorId,
      limit,
      offset,
      createdAtAfter,
      lastMonth,
      lastYear,
      allTime,
    } = data;

    //Setting the datetime with the last month from the first day.
    const lastMonthDate = new Date();
    lastMonthDate.setDate(1);

    //Setting the datetime with the last year from the first month and the first day (example: 2022-01-01).
    const lastYearDate = new Date();
    lastYearDate.setMonth(0);
    lastYearDate.setDate(1);
    const query = this.createQueryBuilder('appraise')
      .select(['appraise'])
      .innerJoinAndSelect('appraise.user', 'user')
      .innerJoinAndSelect('appraise.author', 'author');
    if (userId != null) query.andWhere('user_id = :userId', { userId });
    if (authorId != null) query.andWhere('author_id = :authorId', { authorId });
    if (allTime == null) {
      if (createdAtAfter != null)
        query.andWhere('appraise.created_at >= :createdAtAfter', {
          createdAtAfter,
        });
      if (lastMonth != null) {
        query.andWhere('appraise.created_at >= :lastMonthDate', {
          lastMonthDate,
        });
      }
      if (lastYear != null)
        query.andWhere('appraise.created_at >= :lastYearDate', {
          lastYearDate,
        });
    }
    query
      .orderBy('appraise.createdAt', 'ASC')
      .offset(offset ? Number(offset) : APPRAISE_OFFSET)
      .limit(limit ? Number(limit) : APPRAISE_LIMIT);
    return await query.getMany();
  }
  async findAppraisesUsers(data: GetAppraisesUsersData): Promise<Appraise[]> {
    const {
      userId,
      authorId,
      limit,
      offset,
      createdAtAfter,
      lastMonth,
      lastYear,
      allTime,
    } = data;

    //Setting the datetime with the last month from the first day.
    const lastMonthDate = new Date();
    lastMonthDate.setDate(1);

    //Setting the datetime with the last year from the first month and the first day (example: 2022-01-01).
    const lastYearDate = new Date();
    lastYearDate.setMonth(0);
    lastYearDate.setDate(1);

    const query = this.createQueryBuilder('appraise').select(['appraise']);

    if (allTime == null) {
      if (createdAtAfter != null)
        query.andWhere('appraise.created_at >= :createdAtAfter', {
          createdAtAfter,
        });
      if (lastMonth != null) {
        query.andWhere('appraise.created_at >= :lastMonthDate', {
          lastMonthDate,
        });
      }
      if (lastYear != null)
        query.andWhere('appraise.created_at >= :lastYearDate', {
          lastYearDate,
        });
    }

    if (userId != null) {
      query.andWhere('user_id = :userId', { userId });
      query.innerJoinAndSelect('appraise.author', 'author');
    } else if (authorId != null) {
      query.andWhere('author_id = :authorId', { authorId });
      query.innerJoinAndSelect('appraise.user', 'user');
    } else {
      query.innerJoinAndSelect('appraise.user', 'user');
      query.innerJoinAndSelect('appraise.author', 'author');
    }
    query
      .orderBy('appraise.createdAt', 'ASC')
      .offset(offset ? Number(offset) : APPRAISE_OFFSET)
      .limit(limit ? Number(limit) : 100);
    return await query.getMany();
  }
}
