/** A label which can be attached to an issue. */
export interface Label {
  /** Database id for this label [account/project/id]. */
  id: string;

  /** Text of the label. */
  name: string;

  /** CSS color of the label. */
  color: string;

  /** Project in which this label is defined. */
  project: string;

  /** User that created this label. */
  creator: string;

  /** When the label was created. */
  created: Date;

  /** When the label was last updated. */
  updated: Date;
}
