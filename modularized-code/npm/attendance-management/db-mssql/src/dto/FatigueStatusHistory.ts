export class FatigueStatusDto {
    public fatigueInterviewId?: number;
    public fatigueStatusId?: number;
    public personalDataId?: string;
    public interviewTimestamp?: string;
    public totalScore?: number; 
    public minScore?: number;
    public isPassed?: boolean;
    public status?: number;
    public createdBy?: number;
    public createdAt?: string;
    public modifiedBy?: number;
    public modifiedAt?: string
    public version?: number;
}