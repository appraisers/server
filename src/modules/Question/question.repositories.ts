import { EntityRepository, Repository } from 'typeorm';
import { Question } from '../../entities/Question';
import {
  FindArrayQuestionsByIdData,
  GetQuestionsRequestBody,
  QuestionRepositoryData,
} from './question.interfaces';
@EntityRepository(Question)
export class QuestionRepository extends Repository<Question> {
  async createQuestion(data: QuestionRepositoryData): Promise<Question> {
    const { description, category, weight } = data;
    const question = new Question();
    question.description = description;
    question.category = category;
    question.weight = weight;
    await this.save(question);
    return question;
  }
  async getQuestion(data: GetQuestionsRequestBody): Promise<Question[]> {
    const { offset, limit } = data;
    return this.createQueryBuilder('question')
      .select(['question'])
      .orderBy('question.id', 'ASC')
      .offset(offset)
      .limit(limit)
      .getMany();
  }
  async findArrayQuestionsById(data: FindArrayQuestionsByIdData): Promise<Question[]> {
    const { ids } = data;
    return this.createQueryBuilder('question')
      .where('question.id IN (:...ids)', { ids })
      .getMany();
  }
}
