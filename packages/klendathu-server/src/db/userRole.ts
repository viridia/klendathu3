import { Role } from 'klendathu-json-types';
import { AccountRecord, ProjectRecord } from './types';
import { server } from '../Server';
import * as r from 'rethinkdb';

/** Lookup the project record and compute the user's effective role with respect to that project. */
export async function getProjectAndRole(
  account: string,
  project: string,
  user: AccountRecord):
    Promise<{ projectRecord: ProjectRecord; role: Role }> {
  const projectRecord =
      await r.table('projects').get<ProjectRecord>(`${account}/${project}`).run(server.conn);
  if (!projectRecord) {
    return { projectRecord: null, role: Role.NONE };
  }

  if (projectRecord.owner === user.id) {
    return { projectRecord, role: Role.OWNER };
  }

  // TODO: Check membership and organization.

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
