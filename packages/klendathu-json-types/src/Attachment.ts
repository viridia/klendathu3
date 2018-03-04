/** Information about a file attachment to an issue. */
export interface Attachment {
  /** Name of the attached file. */
  filename: string;

  /** Unique ID of this attachment. */
  id: string;

  /** URL to download the attachment. */
  url: string;

  /** URL of the thumbnail for the attachment, if the type is an image. */
  thumbnail?: string;

  /** MIME type for the attachment. */
  type: string;
}
