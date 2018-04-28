import { CustomFieldChange, ListChange, LinkChange, ScalarChange } from 'klendathu-json-types';

export interface IssueChangeRecord {
  id?: string;
  issue: string;
  project: string;
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
  comments?: {
    added: number;
    updated: number;
    removed: number;
  };
  custom?: CustomFieldChange[];
  linked?: LinkChange[];
}
