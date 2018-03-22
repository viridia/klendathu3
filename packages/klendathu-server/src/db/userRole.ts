import { Role } from 'klendathu-json-types';
import { AccountRecord,  MembershipRecord, ProjectRecord } from './types';
import { zeroOrOne } from './helpers';
import { server } from '../Server';
import * as r from 'rethinkdb';

/** Lookup the project record and compute the user's effective role with respect to that project. */
export async function getProjectAndRole(
  account: string,
  project: string,
  user: AccountRecord):
    Promise<{ projectRecord: ProjectRecord; role: Role }> {
  const projectId = `${account}/${project}`;
  const projectRecord = await r.table('projects').get<ProjectRecord>(projectId).run(server.conn);
  if (!projectRecord) {
    return { projectRecord: null, role: Role.NONE };
  }

  if (user) {
    if (projectRecord.owner === user.id) {
      return { projectRecord, role: Role.OWNER };
    }

    const membership = await r.table('memberships')
      .filter({ project: projectId, user: user.id })
      .run(server.conn)
      .then(zeroOrOne<MembershipRecord>({ projectId, user: user.id }));

    if (membership) {
      return { projectRecord, role: membership.role };
    }

    const owner = await r.table('accounts')
        .get<AccountRecord>(projectRecord.owner).run(server.conn);
    if (owner.type === 'organization') {
      const orgMembership = await r.table('memberships')
        .filter({ organization: owner.id, user: user.id })
        .run(server.conn)
        .then(zeroOrOne<MembershipRecord>({ table: 'accounts', projectId, user: user.id }));
      if (orgMembership) {
        return { projectRecord, role: orgMembership.role };
      }
    }
  }

  if (projectRecord.isPublic) {
    return { projectRecord, role: Role.VIEWER };
  }
  return { projectRecord, role: Role.NONE };
}

/** Compute the user's effective role with respect to an account. */
export async function getAccountAndRole(account: string, user: AccountRecord): Promise<Role> {
  if (user.id === account) {
    return Role.OWNER;
  }
  return Role.NONE;
}
