// import { Attachment } from './Attachment';
import { Relation } from './Relation';

/** A change to a scalar field. */
export interface ScalarChange {
  /** Value of the field before the change. */
  before?: string;

  /** Value of the field after the change. */
  after?: string;
}

/** A change to a string list field. */
export interface ListChange<T> {
  /** List of entries that were added to the field. */
  added?: T[];

  /** List of entries that were removed from the field. */
  removed?: T[];
}

/** A change to a linked issue. */
export interface LinkChange {
  /** ID of the issue being linked to. */
  to: string;

  /** Relationship before the change. */
  before?: Relation;

  /** Relationship after the change. */
  after?: Relation;
}

/** A change to a custom field. */
export interface CustomFieldChange {
  /** ID of the issue being linked to. */
  name: string;

  /** Value of the field before the change. */
  before?: string | number | boolean;

  /** Value of the field after the change. */
  after?: string | number | boolean;
}

/** A change record for an issue. */
export interface Change {
  /** ID of the user making this change. */
  by: string;

  /** Date and time when the changes were made. */
  at: Date;

  /** Change to the issue type. */
  type?: ScalarChange;

  /** Change to the issue state. */
  state?: ScalarChange;

  /** Change to the issue summary. */
  summary?: ScalarChange;

  /** Change to the issue description. */
  description?: ScalarChange;

  /** Change to the issue owner. */
  owner?: ScalarChange;

  /** Changes to the issue cc list. */
  cc?: ListChange<string>;

  /** Changes to the list of issue labels. */
  labels?: ListChange<string>;

  /** Changes to the issue attachment list. */
  attachments?: ListChange<string>;

  /** Changes to the list of custom fields. */
  custom?: CustomFieldChange[];

  /** Changes to the list of linked issues. */
  linked?: LinkChange[];
}
