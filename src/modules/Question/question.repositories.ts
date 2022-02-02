import { EntityRepository, Repository } from 'typeorm';
import { Question } from '../../entities/Question';
import { QuestionRepositoryData } from './question.interfaces';

@EntityRepository(Question)
export class QuestionRepository extends Repository<Question> {
  async createQuestion(data: QuestionRepositoryData): Promise<Question> {
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
  