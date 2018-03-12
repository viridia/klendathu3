import { Relation } from './Relation';

/** Defines a relationship between one issue and another. */
export interface IssueLink {
  /** ID of issue to which this is linked [account/project/id]. */
  to: string;

  /** Type of the relation. */
  relation: Relation;
}

/** Defines a relationship between one issue and another, includes both ends of the link. */
export interface IssueArc {
  /** ID of issue to which this is linked [account/project/id]. */
  to: string;

  /** ID of issue from which this is linked [account/project/id]. */
  from: string;

  /** Type of the relation. */
  relation: Relation;
}
