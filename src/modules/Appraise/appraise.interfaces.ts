import { User } from '../../entities/User';
import { Appraise } from '../../entities/Appraise';
import { ID } from '../../common/common.interfaces';

export interface AppraiseResponse {
    appraises: Appraise[];
}

export interface CreateAppraiseResponse {
    user: User;
    author: User;
}

export interface SetStatusResponse {
    userId: ID;
    authorId: ID;
}

export interface getAppraiseResponse {
    userId: ID;
    authorId: ID;
    limit: number;
    offset: number;
    createdAtAfter: Date;
    lastMonth: boolean;
    lastYear: boolean;
}