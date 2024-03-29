import { FastifyRequest, FastifyInstance } from 'fastify';
import { CommonResponse } from '../../common/common.interfaces';
import { commonResponse } from '../../common/common.constants';
import { allErrors } from '../../common/common.messages';
import { buildError } from '../../utils/error.helper';
import { checkAuthHook, allowedFor } from '../../utils/utils';
import { AppraiseResponse, GetAppraiseResponse, GetAppraisesUsersResponse, GetAppraisesUsersData } from './appraise.interfaces';
import { roles } from '../../entities/User';
import { getAppraisesService, getAppraisesUsersService } from './appraise.services';

const routes = async (fastify: FastifyInstance): Promise<void> => {
    const getAppraisersController = async (
        request: FastifyRequest
    ): Promise<AppraiseResponse | null> => {
        try {
            const {
                userId,
                limit,
                offset,
                authorId,
                createdAtAfter,
                lastMonth,
                lastYear,
                allTime,
            } = request.query as GetAppraiseResponse;
            const data: GetAppraiseResponse = {
                userId,
                authorId,
                offset,
                limit,
                createdAtAfter,
                lastMonth,
                lastYear,
                allTime,
            };
            const appraises = await getAppraisesService(data as GetAppraiseResponse);
            return { ...commonResponse, appraises };
        } catch (error) {
            throw error;
        }
    };

    const getAppraisesUsersController = async (
        request: FastifyRequest
    ): Promise<GetAppraisesUsersResponse | null> => {
        try {
            const {
                userId,
                limit,
                offset,
                authorId,
                createdAtAfter,
                lastMonth,
                lastYear,
                allTime,
            } = request.query as GetAppraisesUsersData;
            const data: GetAppraisesUsersData = {
                userId,
                authorId,
                offset,
                limit,
                createdAtAfter,
                lastMonth,
                lastYear,
                allTime,
            };
            const { users, authors } = await getAppraisesUsersService(data as GetAppraisesUsersData);
            return { ...commonResponse, users, authors };
        } catch (error) {
            throw error;
        }
    };

    fastify.get(
        '/get-appraises',
        {
            onRequest: checkAuthHook(fastify.jwt),
            preValidation: allowedFor([roles.admin, roles.moderator]),
        },
        getAppraisersController
    );

    fastify.get(
        '/get-appraises-users',
        {
            onRequest: checkAuthHook(fastify.jwt),
            preValidation: allowedFor([roles.admin, roles.moderator]),
        },
        getAppraisesUsersController
    );
};

export default routes;
