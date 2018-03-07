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
  created: string;

  /** When this project was last updated. */
  updated: string;

  /** Issue template for this project. */
  template?: string;

  /** If true, indicates that this project is visible to the public. */
  isPublic: boolean;
}
