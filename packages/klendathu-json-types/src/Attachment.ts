/** Information about a file attachment to an issue. */
export interface Attachment {
  /** Unique ID of this attachment. */
  id: string;

  /** Name of the attached file. */
  filename: string;

  /** ID of issue this is attached to. */
  // issue?: string;

  /** ID of comment this is attached to. */
  // comment?: string;

  /** URL to download the attachment. */
  url: string;

  /** URL of the thumbnail for the attachment, if the type is an image. */
  thumbnail?: string;

  /** MIME type for the attachment. */
  type: string;
}
