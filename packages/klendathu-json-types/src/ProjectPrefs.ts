/** One of the user's saved filters. */
export interface Filter {
  /** Name of this filter. */
  name: string;

  /** JSON-encoded filter expression. */
  value: string;

  /** Which view this was (issues, progress, etc.). */
  view?: string;
}

/** Stores the project-specific settings for a user: role, prefs, etc. */
export interface ProjectPrefs {
  /** Database id of this prefs record: account/project/user */
  id?: string;

  /** List of columns to display in the issue list. */
  columns?: string[];

  /** List of label names to display in the issue summary list. */
  labels?: string[];

  /** List of saved queries. */
  filters: Filter[];
}

/** Used to update project prefs. */
export interface ProjectPrefsInput {
  /** List of columns to display in the issue list. */
  columns?: string[];
}
