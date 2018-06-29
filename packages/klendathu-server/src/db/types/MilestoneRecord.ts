import { MilestoneStatus } from 'klendathu-json-types';

export interface MilestoneRecord {
  id: string;
  project: string; // account/project
  name: string;
  status: MilestoneStatus;
  description: string;
  startDate: Date;
  endDate: Date;
}
