import { CustomFieldChange, ListChange, LinkChange, ScalarChange } from 'klendathu-json-types';

export interface IssueChangeRecord {
  issue: string;
  by: string;
  at: Date;
  type?: ScalarChange;
  state?: ScalarChange;
  summary?: ScalarChange;
  description?: ScalarChange;
  owner?: ScalarChange;
  cc?: ListChange<string>;
  labels?: ListChange<string>;
  attachments?: {
    added?: string[];
    removed?: string[];
  };
  custom?: CustomFieldChange[];
  linked?: LinkChange[];
}
