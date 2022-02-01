import { EntityRepository, Repository} from 'typeorm';
//import { genSaltSync, hashSync } from 'bcryptjs';
import { Question } from 'src/entities/Question';
import { RegisterRepositoryData} from './question.interfaces';

@EntityRepository(Question)
export class QuestionRepository extends Repository<Question> {
  async createQuestion(data: RegisterRepositoryData): Promise<Question> {
    const {
      description,
      category,
      weight,
    } = data;

    const question = new Question();
    question.description = description;
    question.category = category;
    question.weight = weight;
    await this.save(question);
    return question;
  }
}
  