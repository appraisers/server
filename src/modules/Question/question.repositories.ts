import { EntityRepository, Repository} from 'typeorm';
//import { genSaltSync, hashSync } from 'bcryptjs';
import { Review } from '../../entities/Question';
import { RegisterRepositoryData} from './question.interfaces';

@EntityRepository(Review)
export class QuestionRepository extends Repository<Review> {
  async createQuestion(data: RegisterRepositoryData): Promise<Review> {
    const {
      description,
      category,
      weight,
    } = data;

    const question = new Review();
    question.description = description;
    question.category = category;
    question.weight = weight;
    await this.save(question);
    return question;
  }
}
  