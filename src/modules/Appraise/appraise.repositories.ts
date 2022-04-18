import { EntityRepository, Repository } from 'typeorm';
import { Appraise } from '../../entities/Appraise';
import { CreateAppraiseResponse, SetStatusResponse } from './appraise.interfaces';
import { getAppraiseResponse } from './appraise.interfaces';
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
    async setStatusTrue(data: SetStatusResponse) {
        const { userId, authorId } = data;
        return this.createQueryBuilder('appraise')
            .update(Appraise)
            .set({ status: true })
            .where('user_id = :userId', { userId })
            .andWhere('author_id = :authorId', { authorId })
            .execute();
    }
    async findAppraises(data: getAppraiseResponse): Promise<Appraise[]> {
        const { userId, authorId, limit, offset, createdAtAfter, lastMonth, lastYear } = data;

        //Setting the datetime with the last month from the first day.
        let dateTimeWithLastMonth = new Date;
        dateTimeWithLastMonth.setDate(1);

        //Setting the datetime with the last year from the first month and the first day (example: 2022-01-01).
        let dateTimeWithLastYear = new Date;
        dateTimeWithLastYear.setMonth(0);
        dateTimeWithLastYear.setDate(1);

        return this.createQueryBuilder('appraise')
            .select('')
            .where(userId ? 'user_id = :userId' : '1=1', { userId })
            .andWhere(authorId ? 'author_id = :authorId' : '1=1', { authorId })
            .andWhere(createdAtAfter ? 'created_at >= :createdAtAfter' : '1=1', { createdAtAfter })
            .andWhere(lastMonth ? 'created_at >= :dateTimeWithLastMonth' : '1=1', { dateTimeWithLastMonth })
            .andWhere(lastYear ? 'created_at >= :dateTimeWithLastYear' : '1=1', { dateTimeWithLastYear })
            .orderBy('appraise.createdAt', 'ASC')
            .limit(limit)
            .offset(offset)
            .getMany()
    }
}
