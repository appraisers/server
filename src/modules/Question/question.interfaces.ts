import { Question } from '../../entities/Question';
import { CommonResponse} from '../../common/common.interfaces';


export interface AddQuestionRequestBody {
  description: string;
  category: string;
  weight: number;
}

export type RegisterRepositoryData = AddQuestionRequestBody;

export interface RegistrationResponse extends CommonResponse {
  question: Question;
}





