/** A project definition. */
export interface Project {
  /** Unique ID of this project [account/projectId]. */
  id: string;

  /** Short description of the project. */
  title: string;

  /** A more detailed description of the project. */
  description: string;

  /** Account that owns this project. */
  owner: string;

  /** When this project was created. */
  created: Date;

  /** When this project was last updated. */
  updated: Date;

  /** User's role with respect to this project. */
  role: number;

  /** Issue template for this project. */
  template?: string;

  /** Workflow configuration for this project. */
  workflow?: string;

  /** If true, indicates that this project is visible to the public. */
  isPublic?: boolean;
}
