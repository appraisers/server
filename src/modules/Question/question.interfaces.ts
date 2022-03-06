import { Question } from '../../entities/Question';
import { CommonResponse, ID } from '../../common/common.interfaces';
export interface AddQuestionRequestBody {
  description: string;
  category: string;
  weight: number;
  position: string;
}

export interface GetCategoriesController extends CommonResponse {
  categories: {
    effectiveness: string;
    interaction: string;
    assessmentOfAbilities: string;
    personalQualities: string;
    default: string;
  };
}

export interface DeleteQuestionsData {
  ids: ID[];
}
export interface GetQuestionsRequestBody {
  offset: number;
  limit: number;
  position: string;
  allQuestions?: boolean;
}
export interface FindArrayQuestionsByIdData {
  ids: ID[];
}
export type QuestionRepositoryData = AddQuestionRequestBody;
export interface QuestionResponse extends CommonResponse {
  question: Question;
}
export interface GetQuestionResponse extends CommonResponse {
  questions: Question[];
}
export interface CountAllQuestionsByPosition {
  position: string;
}