export enum MilestoneStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  CONCLUDED = 'concluded',
  STATIC = 'static',
}

export interface MilestoneInput {
  name: string;
  status: MilestoneStatus;
  description: string;
  startDate?: Date;
  endDate?: Date;
}

export interface Milestone extends MilestoneInput {
  id: string;
  project: string; // account/project
}
