import { Review } from '../../entities/Review';
import { ID } from '../../common/common.interfaces';

export interface CreateRatingRepositoryData {
  review: Review;
}

export interface UpdateRating {
  effectivenessRating: number;
  interactionRating: number;
  assessmentOfAbilitiesRating: number;
  personalQualitiesRating: number;
  defaultRating: number;
  effectivenessWeight: number;
  interactionWeight: number;
  assessmentOfAbilitiesWeight: number;
  personalQualitiesWeight: number;
  defaultWeight: number
  ratingId: ID;
}

export interface LastUpdateRating {
  ratingId: ID;
  rating: number;
  effectivenessRating: number;
  interactionRating: number;
  assessmentOfAbilitiesRating: number;
  personalQualitiesRating: number;
  defaultRating: number;
}
