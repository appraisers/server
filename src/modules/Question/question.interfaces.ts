import { Question } from '../../entities/Question';
import { CommonResponse, ID } from '../../common/common.interfaces';
export interface AddQuestionRequestBody {
  description: string;
  category: string;
  weight: number;
}
export interface GetQuestionsRequestBody {
  id: ID;
}
export type QuestionId = GetQuestionsRequestBody;
export type QuestionRepositoryData = AddQuestionRequestBody;
export interface QuestionResponse extends CommonResponse {
  question: Question | undefined;
}
export interface GetQuestionResponse extends CommonResponse {
  questions: {};
}
