import { getCustomRepository } from 'typeorm';
import { Review } from '../../entities/Review';
import { buildError } from '../../utils/error.helper';
import { UserRepository } from '../Auth/auth.repositories';
import { allErrors } from '../../common/common.messages';
import { DecodedJWT, JWT } from '../../common/common.interfaces';
import { sendEmail } from '../../utils/mail.helper';
import { QuestionRepository } from '../Question/question.repositories';
import config from '../../config';
import { ReviewRepository } from './review.repositories';
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
  DONT_KNOW_ANSWER,
} from './review.constants';

const { FRONTEND_URL } = config;

export const checkReviewsService = async (
  data: CheckReviewsData
): Promise<Review[]> => {
  const reviewRepo = getCustomRepository(ReviewRepository);
  const reviews = await reviewRepo.findReviews(data);
  if (!reviews) throw buildError(400, allErrors.reviewsIsNotFound);

  return reviews;
};

export const inviteAppriceService = async (
  data: InviteAppriceData
): Promise<InviteAppriceResponse[]> => {
  const { userId, email } = data;
  const userRepo = getCustomRepository(UserRepository);
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
  return [];
};

export const addAnswerService = async (
  data: AddAnswerData,
  token: string,
  jwt: JWT
): Promise<null> => {
  const reviewRepo = getCustomRepository(ReviewRepository);
  const userRepo = getCustomRepository(UserRepository);
  const questionRepo = getCustomRepository(QuestionRepository);

  const { userId, ids, answers, isLastAnswer } = data;
  // Find appraising user
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) throw buildError(400, allErrors.userNotFound);

  // Find or create review
  let review = await reviewRepo.findReviewByUserId(userId);
  if (!review) {
    review = await createReviewService(data, token, jwt);
  }
  if (!review) throw buildError(400, allErrors.reviewsIsNotFound);

  let temporaryRating = review.temporaryRating;
  let answeredQuestions = review.answeredQuestions;
  let activeSession = review.activeSession;
  let rating = review.rating;
  let answerDontKnowCount = 0;
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

  // Get questions from params
  let questions = await questionRepo.findArrayQuestionsById({ ids });

  // Count sum answers
  answers.forEach((value, index) => {
    if (
      (value < REVIEWS_ANSWERS_MIN_VALUE && value !== DONT_KNOW_ANSWER) ||
      value > REVIEWS_ANSWERS_MAX_VALUE
    )
      throw buildError(400, allErrors.incorectAnswer);

    if (DONT_KNOW_ANSWER === value) {
      answerDontKnowCount += 1;
    } else {
      const weight = questions[index]?.weight;
      if (!weight) throw buildError(400, allErrors.weightNotFound);
      temporaryRating += (value * weight) / 10;
    }
  });
  // Update count of question
  answeredQuestions += REVIEWS_ANSWERS_COUNT;

  // Count average rating (if value === -1 don't effect on temporaryRating)
  if (answerDontKnowCount !== REVIEWS_ANSWERS_COUNT) {
    temporaryRating =
      temporaryRating /
      (review.temporaryRating === 0
        ? REVIEWS_ANSWERS_COUNT - answerDontKnowCount
        : REVIEWS_ANSWERS_COUNT + 1 - answerDontKnowCount);
  }

  const dataForUpdate = {
    answeredQuestions,
    temporaryRating,
    reviewId: review.id,
  };
  if (isLastAnswer) {
    activeSession = false;
    answeredQuestions = 0;
    rating = temporaryRating;
    temporaryRating = 0;
    const dataForLastUpdate = {
      answeredQuestions,
      temporaryRating,
      activeSession,
      rating,
      reviewId: review.id,
    };
    reviewRepo.lastUpdateTemporaryRating(dataForLastUpdate);
  }
  const updateReview = await reviewRepo.updateTemporaryRating(dataForUpdate);
  if (!updateReview?.affected) {
    throw buildError(400, allErrors.reviewNotFound);
  }
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
