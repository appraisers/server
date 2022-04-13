import { EntityRepository, Repository } from 'typeorm';
import { Question } from '../../entities/Question';
import {
  DeleteQuestionsData,
  FindArrayQuestionsByIdData,
  GetQuestionsRequestBody,
  QuestionRepositoryData,
  CountAllQuestionsByPosition,
} from './question.interfaces';
@EntityRepository(Question)
export class QuestionRepository extends Repository<Question> {
  async createQuestion(data: QuestionRepositoryData): Promise<Question> {
    const { description, category, weight, position } = data;
    const question = new Question();
    question.description = description;
    question.category = category;
    question.weight = weight;
    question.position = position;
    await this.save(question);
    return question;
  }
  async getAllQuestions(): Promise<Question[]> {
    return this.createQueryBuilder('question')
      .select(['question'])
      .where('question.deletedAt IS NULL')
      .orderBy('question.id', 'ASC')
      .getMany();
  }
  async getQuestions(data: GetQuestionsRequestBody): Promise<Question[]> {
    const { offset, limit, position } = data;
    const defaultPosition = 'default';
    return this.createQueryBuilder('question')
      .select(['question'])
      .where('question.position = :position', { position })
      .orWhere('question.position = :defaultPosition', { defaultPosition })
      .andWhere('question.deletedAt IS NULL')
      .orderBy('question.id', 'ASC')
      .offset(offset)
      .limit(limit)
      .getMany();
  }
  async findArrayQuestionsById(
    data: FindArrayQuestionsByIdData
  ): Promise<Question[]> {
    const { ids } = data;
    return this.createQueryBuilder('question')
      .where('question.id IN (:...ids)', { ids })
      .getMany();
  }
  async getCountAllQuestions({
    position,
  }: CountAllQuestionsByPosition): Promise<number> {
    const defaultPosition = 'default';
    ; return this.createQueryBuilder('question')
      .select(['question'])
      .where('question.position = :position', { position })
      .orWhere('question.position = :defaultPosition', { defaultPosition })
      .getCount();
  }
  async deleteQuestions(data: DeleteQuestionsData) {
    const { ids } = data;

    return this.createQueryBuilder('question')
      .update(Question)
      .set({
        deletedAt: new Date(),
      })
      .where('id IN (:...ids)', { ids })
      .andWhere('deleted_at is NULL')
      .execute();
  }
}
