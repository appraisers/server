import { EntityRepository, Repository } from 'typeorm';
import { Question } from '../../entities/Question';
import {
  GetQuestionsRequestBody,
  QuestionRepositoryData,
} from './question.interfaces';
import { QuestionId } from './question.interfaces';
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
  async getQuestion(data: GetQuestionsRequestBody): Promise<{}> {
    const { id } = data;
    const questions = [];
    for (let i = id + 1; i <= id + 4; i++) {
      questions.push(
        await this.createQueryBuilder('question')
          .where('question.id = :id', { id: i })
          .getOne()
      );
      if (questions[questions.length - 1] === undefined) questions.pop();
    }
    return questions;
  }
}
