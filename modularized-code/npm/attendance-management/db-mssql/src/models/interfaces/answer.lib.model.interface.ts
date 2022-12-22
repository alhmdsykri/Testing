export interface AnswerLibAttribute {
  answerLibId: number;
  questionLibId: number;
  questionText: string;
  answerText: string;
  isCorrect: boolean;
  score: number;
  status: number;
  createdBy: number;
  createdAt: string;
  modifiedBy?: number;
  modifiedAt?: string;
  version?: number;
}
