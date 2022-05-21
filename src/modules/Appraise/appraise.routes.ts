import { FastifyRequest, FastifyInstance } from 'fastify';
import { CommonResponse } from '../../common/common.interfaces';
import { commonResponse } from '../../common/common.constants';
import { allErrors } from '../../common/common.messages';
import { buildError } from '../../utils/error.helper';
import { checkAuthHook, allowedFor } from '../../utils/utils';
import { AppraiseResponse, getAppraiseResponse, getAppraisesUsersResponse, getAppraisesUsersData } from './appraise.interfaces';
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
            } = request.query as getAppraiseResponse;
            const data: getAppraiseResponse = {
                userId,
                authorId,
                offset,
                limit,
                createdAtAfter,
                lastMonth,
                lastYear,
            };
            const appraises = await getAppraisesService(data as getAppraiseResponse);
            return { ...commonResponse, appraises };
        } catch (error) {
            throw error;
        }
    };

    const getAppraisesUsersController = async (
        request: FastifyRequest
    ): Promise<getAppraisesUsersResponse | null> => {
        try {
            const {
                userId,
                limit,
                offset,
                authorId,
            } = request.query as getAppraisesUsersData;
            const data: getAppraisesUsersData = {
                userId,
                authorId,
                offset,
                limit,
            };
            const users = await getAppraisesUsersService(data as getAppraisesUsersData);
            return { ...commonResponse, users };
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
