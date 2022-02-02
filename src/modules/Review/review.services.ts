import { getCustomRepository } from 'typeorm';
import { Review } from '../../entities/Review';
import { buildError } from '../../utils/error.helper';
import { UserRepository } from '../Auth/auth.repositories';
import { DecodedJWT, JWT } from '../../common/common.interfaces';
import { sendEmail } from '../../utils/mail.helper';
import { checkAdminOrModeratorService } from '../User/user.services';
import config from '../../config';
import { ReviewRepository } from './review.repositories';
import { allErrors } from './review.messages';
import {
  AddAnswerData,
  CheckReviewsData,
  CreateReviewData,
  InviteAppriceResponse,
  InviteAppriceData,
} from './review.interfaces';
import {
  REVIEWS_ANSWERS_COUNT,
  REVIEWS_ANSWERS_IDS_COUNT,
  REVIEWS_ANSWERS_MIN_VALUE,
  REVIEWS_ANSWERS_MAX_VALUE,
} from './review.constants';

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

export const addAnswerService = async (
  data: AddAnswerData,
  token: string,
  jwt: JWT
): Promise<null> => {
  const reviewRepo = getCustomRepository(ReviewRepository);
  const userRepo = getCustomRepository(UserRepository);
  const decoded: DecodedJWT = jwt.verify(token);
  if (decoded.isRefresh) throw buildError(400, allErrors.incorectToken);

  const { userId, ids, answers } = data;
  // Find author
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) throw buildError(400, allErrors.userNotFound);

  // Find or create review
  let review = await reviewRepo.findReviewByUserId(data.userId);
  if (!review) {
    review = await createReviewService(data, token, jwt);
  }
  if (!review) throw buildError(400, allErrors.reviewsIsNotFound);

  let temporaryRating = review.temporaryRating;
  let answeredQuestions = review.answeredQuestions;
  // Check temporaryRating
  if (temporaryRating !== 0 && !temporaryRating) {
    throw buildError(400, allErrors.temporaryRatingIsNotFound);
  }
  // Check answers, ids from body
  if (answers.length !== REVIEWS_ANSWERS_COUNT) {
    throw buildError(400, allErrors.incorectLengthAnswer);
  }
  if (ids.length !== REVIEWS_ANSWERS_IDS_COUNT) {
    throw buildError(400, allErrors.incorectLengthId);
  }

  // Count sum answers
  answers.forEach((value) => {
    if (
      value < REVIEWS_ANSWERS_MIN_VALUE ||
      value > REVIEWS_ANSWERS_MAX_VALUE
    ) {
      throw buildError(400, allErrors.incorectAnswer);
    }
    temporaryRating += value;
  });
  // Update count of question
  answeredQuestions += REVIEWS_ANSWERS_COUNT;

  // Count average rating
  temporaryRating =
    temporaryRating /
    (temporaryRating === 0 ? REVIEWS_ANSWERS_COUNT : REVIEWS_ANSWERS_COUNT + 1);

  const dataForUpdate = {
    answeredQuestions,
    temporaryRating,
    reviewId: review.id,
  };
  const updateReview = await reviewRepo.updateTemporaryRating(dataForUpdate);
  if (!updateReview?.affected) throw buildError(400, allErrors.reviewNotFound);

  console.log(temporaryRating, ids, answers);
  return null;
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
