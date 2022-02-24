import { getCustomRepository } from 'typeorm';
import { Category } from '../../entities/Question';
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
  FinishAnswerData,
} from './review.interfaces';
import {
  DONT_KNOW_ANSWER,
  INITIAL_VALUE_COUNT_CATEGORIES,
  NORMALIZATION_DIVISOR,
  REVIEWS_ANSWERS_MIN_VALUE,
  REVIEWS_ANSWERS_MAX_VALUE,
  ZERO,
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
  const { email, userId } = data;
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
): Promise<boolean> => {
  const reviewRepo = getCustomRepository(ReviewRepository);
  const userRepo = getCustomRepository(UserRepository);
  const questionRepo = getCustomRepository(QuestionRepository);

  const { userId, ids, answers } = data;
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
  let effectivenessRating = review.effectivenessRating;
  let interactionRating = review.interactionRating;
  let assessmentOfAbilitiesRating = review.assessmentOfAbilitiesRating;
  let personalQualitiesRating = review.personalQualitiesRating;
  let answerDontKnowCount = 0;
  let effectivenessCount = effectivenessRating
    ? INITIAL_VALUE_COUNT_CATEGORIES
    : ZERO;
  let interactionCount = interactionRating
    ? INITIAL_VALUE_COUNT_CATEGORIES
    : ZERO;
  let assessmentOfAbilitiesCount = assessmentOfAbilitiesRating
    ? INITIAL_VALUE_COUNT_CATEGORIES
    : ZERO;
  let personalQualitiesCount = personalQualitiesRating
    ? INITIAL_VALUE_COUNT_CATEGORIES
    : ZERO;

  // Check temporaryRating
  if (temporaryRating !== 0 && !temporaryRating) {
    throw buildError(400, allErrors.temporaryRatingIsNotFound);
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
      const normalizeRating = (value * weight) / 10;
      temporaryRating += normalizeRating;

      switch (questions[index]?.category) {
        case Category.EFFECTIVENESS: {
          effectivenessRating += normalizeRating;
          effectivenessCount++;
          if (effectivenessCount > INITIAL_VALUE_COUNT_CATEGORIES) {
            effectivenessRating /= NORMALIZATION_DIVISOR;
          }
          break;
        }
        case Category.INTERACTION: {
          interactionRating += normalizeRating;
          interactionCount++;
          if (interactionCount > INITIAL_VALUE_COUNT_CATEGORIES) {
            interactionRating /= NORMALIZATION_DIVISOR;
          }
          break;
        }
        case Category.ASSESSMENT_OF_ABILITIES: {
          assessmentOfAbilitiesRating += normalizeRating;
          assessmentOfAbilitiesCount++;
          if (assessmentOfAbilitiesCount > INITIAL_VALUE_COUNT_CATEGORIES) {
            assessmentOfAbilitiesRating /= NORMALIZATION_DIVISOR;
          }
          break;
        }
        case Category.PERSONAL_QUALITIES: {
          personalQualitiesRating += normalizeRating;
          personalQualitiesCount++;
          if (personalQualitiesCount > INITIAL_VALUE_COUNT_CATEGORIES) {
            personalQualitiesRating /= NORMALIZATION_DIVISOR;
          }
          break;
        }
      }
    }
  });
  // Update count of question
  answeredQuestions += answers.length;

  // Count average rating (if value === -1 don't effect on temporaryRating)
  if (answerDontKnowCount !== answers.length) {
    temporaryRating =
      temporaryRating /
      (review.temporaryRating === 0
        ? answers.length - answerDontKnowCount
        : answers.length + 1 - answerDontKnowCount);
  }

  const dataForUpdate = {
    answeredQuestions,
    temporaryRating,
    effectivenessRating,
    interactionRating,
    assessmentOfAbilitiesRating,
    personalQualitiesRating,
    reviewId: review.id,
  };

  let isLastAnswers;
  let countQuestions = await questionRepo.getCountAllQuestions();

  if (countQuestions === answeredQuestions) {
    isLastAnswers = true;
  } else isLastAnswers = false;

  const updateReview = await reviewRepo.updateTemporaryRating(dataForUpdate);
  if (!updateReview?.affected) {
    throw buildError(400, allErrors.reviewNotFound);
  }

  return isLastAnswers;
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

export const addFinishAnswerService = async (
  data: FinishAnswerData
): Promise<null> => {
  const { description, userId } = data;
  const userRepo = getCustomRepository(UserRepository);
  const reviewRepo = getCustomRepository(ReviewRepository);

  const user = await userRepo.findOneUserByKey('id', userId);
  if (!user) throw buildError(400, allErrors.userNotFound);

  const review = await reviewRepo.findReviewByUserId(userId);
  if (!review) throw buildError(400, allErrors.reviewsIsNotFound);

  const dataForLastUpdate = {
    answeredQuestions: 0,
    temporaryRating: 0,
    activeSession: false,
    rating: review.temporaryRating,
    reviewId: review.id,
    description,
  };
  reviewRepo.lastUpdateTemporaryRating(dataForLastUpdate);

  let userRating = user.rating;
  const numberOfCompletedReviews = user.numberOfCompletedReviews + 1;
  if (userRating != null) {
    userRating = (userRating + review.temporaryRating) / 2;
  } else userRating = review.temporaryRating;

  userRepo.updateUserAfterReview({
    userId,
    rating: userRating,
    numberOfCompletedReviews,
  });

  sendEmail({
    type: 'successfully-appraisers',
    emailTo: user.email,
    subject: 'You have been successfully evaluated!',
  });
  return null;
};
