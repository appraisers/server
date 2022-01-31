import { JWT } from 'fastify';
import { getCustomRepository } from 'typeorm';
import { Review } from '../../entities/Review';
import { buildError } from '../../utils/error.helper';
import { UserRepository } from '../Auth/auth.repositories';
import { DecodedJWT } from '../../common/common.interfaces';
import { sendEmail } from '../../utils/mail.helper';
import { checkAdminOrModeratorService } from '../User/user.services';
import config from '../../config';
import { ReviewRepository } from './review.repositories';
import { allErrors } from './review.messages';
import {
  CheckReviewsData,
  CreateReviewData,
  InviteAppriceResponse,
  InviteAppriceData,
} from './review.interfaces';

const { FRONTEND_URL } = config;

export const checkReviewsService = async (
  data: CheckReviewsData,
  token: string,
  jwt: JWT
): Promise<Review[]> => {
  const reviewRepo = getCustomRepository(ReviewRepository);
  const decoded: DecodedJWT = jwt.verify(token);
  if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);
  const reviews = await reviewRepo.findReviews(data);
  if (!reviews) throw buildError(400, allErrors.reviewsIsNotFound);

  return reviews;
};

export const inviteAppriceService = async (
  data: InviteAppriceData,
  token: string,
  jwt: JWT
): Promise<InviteAppriceResponse[]> => {
  const decoded: DecodedJWT = jwt.verify(token);
  if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);
  const { userId, email } = data;
  const userRepo = getCustomRepository(UserRepository);

  const isAdminOrModerator = await checkAdminOrModeratorService(
    decoded.id,
    token,
    jwt
  );
  if (isAdminOrModerator) {
    const user = await userRepo.findOneUserByKey('id', userId);
    if (!user) throw buildError(400, allErrors.userNotFound);
    
    sendEmail({
      type: 'invite-appraise',
      emailTo: email,
      subject: 'You are invited to appraise',
      replacements: {
        link: `${FRONTEND_URL}/invite-appraise/${userId}`,
        fullname: user.fullname,
      },
    });
  }
  return [];
};

export const createReviewService = async (
  data: CreateReviewData,
  token: string,
  jwt: JWT
): Promise<Review> => {
  const reviewRepo = getCustomRepository(ReviewRepository);
  const userRepo = getCustomRepository(UserRepository);
  const decoded: DecodedJWT = jwt.verify(token);
  if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);
  const { userId } = data;
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) throw buildError(400, allErrors.userNotFound);
  const author = await userRepo.findOne({ where: { id: decoded.id } });
  if (!author) throw buildError(400, allErrors.authorNotFound);

  const review = await reviewRepo.createReview({
    ...data,
    author,
    user,
  });

  return review;
};
