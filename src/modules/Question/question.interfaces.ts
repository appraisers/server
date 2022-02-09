import { Question } from '../../entities/Question';
import { CommonResponse, ID } from '../../common/common.interfaces';
export interface AddQuestionRequestBody {
  description: string;
  category: string;
  weight: number;
}
export interface GetQuestionsRequestBody {
  offset: number;
  limit: number;
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
