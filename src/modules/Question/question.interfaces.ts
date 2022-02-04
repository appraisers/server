import { Question } from '../../entities/Question';
import { CommonResponse, ID } from '../../common/common.interfaces';
export interface AddQuestionRequestBody {
  description: string;
  category: string;
  weight: number;
}
export interface GetQuestionsData {
  questionId: number;
}

export type QuestionRepositoryData = AddQuestionRequestBody;
export interface QuestionResponse extends CommonResponse {
  question: Question;
}
