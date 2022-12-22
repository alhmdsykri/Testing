export interface QuestionLibAttribute {
  questionLibId: number;
  questionCategoryId: number;
  questionText: string;
  questionImage: string;
  isHasImage: boolean;
  status: number;
  createdBy: number;
  createdAt: string;
  modifiedBy?: number;
  modifiedAt?: string;
  version?: number;
}
