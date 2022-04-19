import { EntityRepository, Repository } from 'typeorm';
import { Appraise } from '../../entities/Appraise';
import {
    CreateAppraiseResponse,
    SetAppraiseStatusResponse,
} from './appraise.interfaces';
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
    async setAppraiseStatus(data: SetAppraiseStatusResponse) {
        const { userId, authorId } = data;
        return this.createQueryBuilder('appraise')
            .update(Appraise)
            .set({ status: true })
            .where('user_id = :userId', { userId })
            .andWhere('author_id = :authorId', { authorId })
            .execute();
    }
    async findAppraises(data: getAppraiseResponse): Promise<Appraise[]> {
        const {
            userId,
            authorId,
            limit,
            offset,
            createdAtAfter,
            lastMonth,
            lastYear,
        } = data;

        //Setting the datetime with the last month from the first day.
        let dateTimeWithLastMonth = new Date();
        dateTimeWithLastMonth.setDate(1);

        //Setting the datetime with the last year from the first month and the first day (example: 2022-01-01).
        let dateTimeWithLastYear = new Date();
        dateTimeWithLastYear.setMonth(0);
        dateTimeWithLastYear.setDate(1);
        const query = this.createQueryBuilder('appraise').select(['appraise']);
        if (userId != null) query.andWhere('user_id = :userId', { userId });
        if (authorId != null) query.andWhere('author_id = :authorId', { authorId });
        if (createdAtAfter != null) query.andWhere('created_at >= :createdAtAfter', { createdAtAfter });
        if (lastMonth != null) query.andWhere('created_at >= :dateTimeWithLastMonth', { dateTimeWithLastMonth });
        if (lastYear != null) query.andWhere('created_at >= :dateTimeWithLastYear', { dateTimeWithLastYear })
            .orderBy('appraise.createdAt', 'ASC')
            .limit(limit)
            .offset(offset);
        return await query.getMany();
    }
}
