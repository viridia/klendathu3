// import { Change } from './Change';
import { IssueLink } from './IssueLink';

/** Data for a custom field. */
export interface CustomValues {
  [name: string]: string | number | boolean;
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

  /** Sort key for owners. */
  ownerSort?: string;

  /** Users who wish to be informed when this issue is updated. */
  cc: string[];

  /** Labels associated with this issue. */
  labels: string[];

  /** List of custom fields for this issue. */
  custom: CustomValues;

  /** List of attachments. */
  attachments: string[];

  /** Whether this issue should be visible to non-members of the project. */
  isPublic?: boolean;

  /** X / Y position of issue in mural view. */
  position?: [number, number];
}

export interface Issue extends IssueBase {
  /** Unique id of this issue. [account/project/issueNum] */
  id: string;

  /** ID of the project this issue belongs to (owner/id). */
  project: string;

  /** Username of user that originally reported this issue. */
  reporter: string;

  /** Sort key for reporters. */
  reporterSort?: string;

  /** History of changes for this issue. */
  // changes?: Change[];

  /** Date and time when the issue was created. */
  created: string;

  /** Date and time when the issue was last changed. */
  updated: string;
}

/** An issue. */
export interface IssueInput extends IssueBase {
  /** Used to sort records in order by owner. */
  ownerSort: string;

  /** List of issues linked to this one. */
  linked: IssueLink[];

  /** List of comments. */
  comments: string[];
}

/** An issue. */
export interface IssueEdit extends IssueInput {
  addCC?: string[];
  removeCC: string[];
  addLabels?: string[];
  removeLabels?: string[];
}
