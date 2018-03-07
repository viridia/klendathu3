// Database representation of custom field values
export interface CustomValues {
  [name: string]: string | number | boolean;
}

// Database representation of an issue
export interface IssueRecord {
  id: string; // account/project/index
  type: string;
  state: string;
  summary: string;
  description: string;
  reporter: string;
  owner: string;
  cc: string[];
  created: Date;
  updated: Date;
  labels: string[];
  custom: CustomValues;
  // comments: CommentEntry[];
  // attachments: string[];
  isPublic?: boolean;
}
