/** A comment on an issue. */
export interface Comment {
  /** Comment ID. */
  id?: number;

  /** Issue this comment is attached to. */
  issue: string;

  /** User that created this comment. */
  author?: string;

  /** Body of the comment. */
  body: string;

  /** Date and time when the comment was posted. */
  created: Date;

  /** Date and time when the comment was last edited. */
  updated: Date;
}
