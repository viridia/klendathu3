export enum Errors {
  UNKNOWN = 'unknown',
  INTERNAL = 'internal',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not-found',
  CONFLICT = 'conflict',
  EXISTS = 'exists',
  SCHEMA = 'schema-validation',

  INVALID_LINK = 'invalid-link',
  MISSING_NAME = 'missing-name',
  MISSING_COLOR = 'missing-color',
  MISSING_LABEL = 'missing-label',

  INVALID_EMAIL = 'invalid-email',
  USERNAME_TOO_SHORT = 'username-too-short',
  USERNAME_LOWER_CASE = 'username-lower-case',
  USERNAME_INVALID_CHARS = 'username-invalid-chars',
  PASSWORD_TOO_SHORT = 'password-too-short',
  INCORRECT_PASSWORD = 'incorrect-password',
  INVALID_TOKEN = 'invalid-token',
}
