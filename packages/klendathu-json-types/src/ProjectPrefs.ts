import { Label } from './Label';

/** One of the user's saved filters. */
export interface Filter {
  /** Name of this filter. */
  name: string;

  /** JSON-encoded filter expression. */
  value: string;
}

/** Stores the project-specific settings for a user: role, prefs, etc. */
export interface ProjectPrefs {
  /** List of columns to display in the issue list. */
  columns?: string[];

  /** List of label names to display in the issue summary list. */
  labels?: number[];

  /** List of labels to display in the issue summary list. */
  labelProps: Label[];

  /** List of saved queries. */
  filters: Filter[];
}
