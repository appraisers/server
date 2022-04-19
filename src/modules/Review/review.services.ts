import { getCustomRepository } from 'typeorm';
import { Category } from '../../entities/Question';
import { Review } from '../../entities/Review';
import { buildError } from '../../utils/error.helper';
import { UserRepository } from '../Auth/auth.repositories';
import { RatingRepository } from '../Rating/rating.repositories';
import { QuestionRepository } from '../Question/question.repositories';
import { AppraiseRepository } from '../Appraise/appraise.repositories';
import { allErrors } from '../../common/common.messages';
import { DecodedJWT, ID, JWT } from '../../common/common.interfaces';
import { sendEmail } from '../../utils/mail.helper';
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
  NUMBER_OF_CATEGORIES,
  NORMALIZATION_DIVISOR,
  REVIEWS_ANSWERS_MIN_VALUE,
  REVIEWS_ANSWERS_MAX_VALUE,
  DEFAULT_RATING,
} from './review.constants';

const { FRONTEND_URL } = config;

export const checkReviewsService = async (
  data: CheckReviewsData
): Promise<Review[]> => {
  const reviewRepo = getCustomRepository(ReviewRepository);
  const reviews = await reviewRepo.findReviews(data);
  if (!reviews) throw buildError(400, allErrors.reviewNotFound);
  return reviews;
};

export const inviteAppriceService = async (
  data: InviteAppriceData
): Promise<null> => {
  const { emails, userId } = data;
  const userRepo = getCustomRepository(UserRepository);
  const user = await userRepo.findOneUserByKey('id', userId);
  if (!user) throw buildError(400, allErrors.userNotFound);
  if (emails.length > 0) {
    emails.forEach((email) => {
      sendEmail({
        type: 'invite-appraise',
        emailTo: email,
        subject: 'You are invited to appraise',
        replacements: {
          link: `${FRONTEND_URL}/invite-appraise/${userId}`,
          fullname: user.fullname,
        },
      });
    });
  } else {
    throw buildError(400, allErrors.emptyEmails);
  }

  return null;
};

export const addAnswerService = async (
  data: AddAnswerData,
  authorId: ID,
  token: string,
  jwt: JWT
): Promise<boolean> => {
  const reviewRepo = getCustomRepository(ReviewRepository);
  const userRepo = getCustomRepository(UserRepository);
  const questionRepo = getCustomRepository(QuestionRepository);
  const ratingRepo = getCustomRepository(RatingRepository);
  const appraiseRepo = getCustomRepository(AppraiseRepository);
  const { userId, ids, answers } = data;

  //Finding author
  const author = await userRepo.findOne({ where: { id: authorId } });
  if (!author) throw buildError(400, allErrors.authorNotFound);

  // Find appraising user
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) throw buildError(400, allErrors.userNotFound);

  // Find or create review
  let review = await reviewRepo.findReviewByUserId(userId);
  if (!review) {
    review = await createReviewService(data, token, jwt);
    await appraiseRepo.createAppraise({ user, author });
  }
  if (!review) throw buildError(400, allErrors.reviewNotFound);

  // Find or create rating
  let ratingRow = await ratingRepo.findRatingByReviewId(review.id);
  if (!ratingRow) {
    ratingRow = await ratingRepo.createRating({ review });
  }
  if (!ratingRow) throw buildError(400, allErrors.ratingNotFound);

  let answeredQuestions = review.answeredQuestions;

  let effectivenessRating = ratingRow.effectivenessRating;
  let interactionRating = ratingRow.interactionRating;
  let assessmentOfAbilitiesRating = ratingRow.assessmentOfAbilitiesRating;
  let personalQualitiesRating = ratingRow.personalQualitiesRating;
  let defaultRating = ratingRow.defaultRating;

  let effectivenessWeight = ratingRow.effectivenessWeight;
  let interactionWeight = ratingRow.interactionWeight;
  let assessmentOfAbilitiesWeight = ratingRow.assessmentOfAbilitiesWeight;
  let personalQualitiesWeight = ratingRow.personalQualitiesWeight;
  let defaultWeight = ratingRow.defaultWeight;
  // Get questions from params
  let questions = await questionRepo.findArrayQuestionsById({ ids });

  // Count sum answers
  answers.forEach((value, index) => {
    if (value < REVIEWS_ANSWERS_MIN_VALUE || value > REVIEWS_ANSWERS_MAX_VALUE)
      throw buildError(400, allErrors.incorectAnswer);

    const weight = questions[index]?.weight;
    if (!weight) throw buildError(400, allErrors.weightNotFound);
    const normalizeRating = value * weight;
    //Searching the corresponding category in order to sum rating and weight.
    switch (questions[index]?.category) {
      case Category.EFFECTIVENESS: {
        effectivenessRating += normalizeRating;
        effectivenessWeight += weight;
        break;
      }
      case Category.INTERACTION: {
        interactionRating += normalizeRating;
        interactionWeight += weight;
        break;
      }
      case Category.ASSESSMENT_OF_ABILITIES: {
        assessmentOfAbilitiesRating += normalizeRating;
        assessmentOfAbilitiesWeight += weight;
        break;
      }
      case Category.PERSONAL_QUALITIES: {
        personalQualitiesRating += normalizeRating;
        personalQualitiesWeight += weight;
        break;
      }
      case Category.DEFAULT: {
        defaultRating += normalizeRating;
        defaultWeight += weight;
        break;
      }
      default: {
        throw buildError(400, allErrors.unknownCategory);
      }
    }
  });
  // Update count of question
  answeredQuestions += answers.length;

  const dataForUpdate = {
    answeredQuestions,
    reviewId: review.id,
  };

  const dataForUpdateRating = {
    effectivenessRating,
    interactionRating,
    assessmentOfAbilitiesRating,
    personalQualitiesRating,
    defaultRating,
    effectivenessWeight,
    interactionWeight,
    assessmentOfAbilitiesWeight,
    personalQualitiesWeight,
    defaultWeight,
    ratingId: ratingRow.id,
  };

  let isLastAnswers;
  let countQuestions = await questionRepo.getCountAllQuestions({
    position: user.position!,
  });

  if (countQuestions === answeredQuestions) {
    isLastAnswers = true;
  } else isLastAnswers = false;

  const updateReview = await reviewRepo.updateTemporaryRating(dataForUpdate);
  if (!updateReview?.affected) {
    throw buildError(400, allErrors.reviewNotFound);
  }

  const updateRating = await ratingRepo.updateRating(dataForUpdateRating);
  if (!updateRating?.affected) {
    throw buildError(400, allErrors.ratingNotFound);
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
  const ratingRepo = getCustomRepository(RatingRepository);
  const appraiseRepo = getCustomRepository(AppraiseRepository);
  const user = await userRepo.findOneUserByKey('id', userId);
  if (!user) throw buildError(400, allErrors.userNotFound);
  const review = await reviewRepo.findReviewByUserId(userId);
  if (!review) throw buildError(400, allErrors.reviewNotFound);
  const authorId = review.author.id;
  const rating = await ratingRepo.findRatingByReviewId(review.id);
  if (!rating) throw buildError(400, allErrors.ratingNotFound);
  let effectivenessRating = rating.effectivenessRating;
  let interactionRating = rating.interactionRating;
  let assessmentOfAbilitiesRating = rating.assessmentOfAbilitiesRating;
  let personalQualitiesRating = rating.personalQualitiesRating;
  let defaultRating = rating.defaultRating;
  //Getting the total weight of the review.
  const effectivenessWeight = rating.effectivenessWeight;
  const interactionWeight = rating.interactionWeight;
  const assessmentOfAbilitiesWeight = rating.assessmentOfAbilitiesWeight;
  const personalQualitiesWeight = rating.personalQualitiesWeight;
  const defaultWeight = rating.defaultWeight;
  //in order to don't have NaN or null.
  if (effectivenessWeight !== DEFAULT_RATING)
    effectivenessRating /= effectivenessWeight;
  if (interactionWeight !== DEFAULT_RATING)
    interactionRating /= interactionWeight;
  if (assessmentOfAbilitiesWeight !== DEFAULT_RATING)
    assessmentOfAbilitiesRating /= assessmentOfAbilitiesWeight;
  if (personalQualitiesWeight !== DEFAULT_RATING)
    personalQualitiesRating /= personalQualitiesWeight;
  if (defaultWeight !== DEFAULT_RATING) defaultRating /= defaultWeight;
  //The overall rating of review.
  const overallRating =
    (effectivenessRating +
      interactionRating +
      assessmentOfAbilitiesRating +
      personalQualitiesRating +
      defaultRating) /
    NUMBER_OF_CATEGORIES;
  const dataForLastUpdateRating = {
    effectivenessRating,
    interactionRating,
    assessmentOfAbilitiesRating,
    personalQualitiesRating,
    defaultRating,
    rating: overallRating,
    ratingId: rating.id,
  };
  ratingRepo.lastUpdateRating(dataForLastUpdateRating);
  const dataForLastUpdate = {
    answeredQuestions: 0,
    activeSession: false,
    rating: overallRating,
    reviewId: review.id,
    description,
  };
  reviewRepo.lastUpdateTemporaryRating(dataForLastUpdate);
  let userRating = user.rating;
  const numberOfCompletedReviews = user.numberOfCompletedReviews + 1;
  if (userRating != null) {
    userRating = (userRating + overallRating) / NORMALIZATION_DIVISOR;
  } else userRating = overallRating;
  userRepo.updateUserAfterReview({
    userId,
    rating: userRating,
    numberOfCompletedReviews,
  });
  appraiseRepo.setAppraiseStatus({ userId, authorId });
  sendEmail({
    type: 'successfully-appraisers',
    emailTo: user.email,
    subject: 'You have been successfully evaluated!',
  });
  return null;
};
