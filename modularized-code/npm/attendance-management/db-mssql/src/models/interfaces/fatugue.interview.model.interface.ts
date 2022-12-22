export interface FatigueInterviewAttribute {
  fatigueInterviewId: number;
  personalDataId: number;
  interviewTimestamp: string;
  totalScore: number;
  minScore: number;
  isPassed: boolean;
  fatigueStatusId: number;
  status: number;
  createdBy: number;
  createdAt: string;
  modifiedBy?: number;
  modifiedAt?: string;
  version?: number;
}
