import { Change } from './Change';
import { IssueLink } from './IssueLink';

/** Data for a custom field. */
export interface CustomField {
  name: string;

  /** Value of the custom field. */
  value: string | number | boolean;
}

/** An issue. */
export interface IssueBase {
  /** Issue type (defined by template). */
  type: string;

  /** Current workflow state. */
  state: string;

  /** One-line summary of the issue. */
  summary: string;

  /** Detailed description of the issue. */
  description: string;

  /** Username of current owner of this issue. */
  owner: string;

  /** Users who wish to be informed when this issue is updated. */
  cc: string[];

  /** Labels associated with this issue. */
  labels: string[];

  /** List of issues linked to this one. */
  linked: IssueLink[];

  /** List of custom fields for this issue. */
  custom: CustomField[];

  /** Whether this issue should be visible to non-members of the project. */
  isPublic?: boolean;
}

export interface Issue extends IssueBase {
  /** Unique id of this issue. [account/project/issueNum] */
  id: string;

  /** ID of the project this issue belongs to (owner/id). */
  project: string;

  /** Username of user that originally reported this issue. */
  reporter: string;

  /** History of changes for this issue. */
  changes?: Change[];

  /** Date and time when the issue was created. */
  created: Date;

  /** Date and time when the issue was last changed. */
  updated: Date;
}

/** An issue. */
export interface IssueInput extends IssueBase {
  /** List of attachments. */
  attachments: string[];

  /** List of comments. */
  comments: string[];
}
