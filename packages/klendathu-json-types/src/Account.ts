/** Information about a user or organization. */
export interface Account {
  /** Unique name of this user or organization. */
  uname?: string;

  /** Display name of this user or organization. */
  display: string;

  /** Whether this is a person or an organization. */
  type: 'user' | 'organization';

  /** Profile photo (URL). */
  photo?: string;

  /** User email address. */
  email?: string;

  /** Whether this account has been verified. */
  verified?: boolean;
}
