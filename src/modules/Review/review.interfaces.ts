import { User } from '../../entities/User';
import { Review } from '../../entities/Review';
import { CommonResponse, ID } from '../../common/common.interfaces';

export interface CheckReviewResponse extends CommonResponse {
  reviews: Review[];
}

export interface CreateReviewResponse extends CommonResponse {
  review: Review;
}

export interface InviteAppriceResponse extends CommonResponse {
  user: InviteAppriceData[];
}
export interface InviteAppriceData {
  userId: ID;
  email: string;
}

export interface CheckReviewsData {
  userId: ID;
  offset: number;
  limit: number;
}

export interface CreateReviewData {
  userId: ID;
}

export interface CreateReviewRepositoryData extends CreateReviewData {
  author: User;
  user: User;
}

export interface AddAnswerData {
  userId: ID;
  ids: ID[];
  answers: number[];
}

export interface AddAnswerControllerResponse extends CommonResponse {
  isLastAnswer: boolean;
}

export interface UpdateTemporaryRatingData {
  reviewId: ID;
  answeredQuestions: number;
  effectivenessRating: number;
  interactionRating: number;
  assessmentOfAbilitiesRating: number;
  personalQualitiesRating: number;
  effectivenessWeight: number;
  interactionWeight: number;
  assessmentOfAbilitiesWeight: number;
  personalQualitiesWeight: number;
}

export interface LastUpdateTemporaryRatingData {
  reviewId: ID;
  answeredQuestions: number;
  activeSession: boolean;
  rating: number;
  description: string;
  effectivenessRating: number;
  interactionRating: number;
  assessmentOfAbilitiesRating: number;
  personalQualitiesRating: number;
}

export interface FinishAnswerData {
  userId: ID;
  description: string;
}
