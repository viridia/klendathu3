import { Membership, Role } from 'klendathu-json-types';
import { session } from './Session';

/** All of the projects and organizations this user belongs to. */
export class Memberships {
  public release() {
    //
  }

  get projectMemberships(): Membership[] {
    return [];
  }

  get organizationMemberships(): Membership[] {
    return [];
  }

  public getProjectRole(projectId: string, projectOwner: string) {
    // console.log('project role:', project, session.userId);
    if (projectOwner === session.userId) {
      return Role.OWNER;
    }
    return Role.NONE;
    // const m = this.projectMap.get(project);
    // return m ? m.role : Role.NONE;
  }

  public getOrganizationRole(org: string) {
    return Role.NONE;
    // const m = this.orgMap.get(org);
    // return m ? m.role : Role.NONE;
  }
}
