export interface IRequestSubmitFatigue {
  personalDataId: number;
  interviewTimestamp: Date;
  totalScore: number;
  minScore: number;
  isPassed: boolean;
  fatigueStatusId: number;
}
