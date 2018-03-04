/** Stores the project-specific settings for a user: role, prefs, etc. */
export interface Membership {
  /** User name of project member. */
  user: string;

  /** Project scope of membership. */
  project?: string;

  /** Organization scope of membership. */
  organization?: string;

  /** Access level for the this user (direct as project member). */
  role: number;

  /** When the member was added to the project. */
  created: Date;

  /** When the membership was last changed. */
  updated: Date;

  /** Access level for the this user (indirect as organization member). */
  // inheritedRole: number;
}
