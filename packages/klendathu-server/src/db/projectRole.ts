import { Role } from 'klendathu-json-types';
import { AccountRecord, ProjectRecord } from './types';
import { server } from '../Server';
import * as r from 'rethinkdb';

export async function getProjectAndRole(
  owner: string,
  project: string,
  user: AccountRecord):
    Promise<{ projectRecord: ProjectRecord; role: Role }> {
  const projectRecord =
      await r.table('projects').get<ProjectRecord>(`${owner}/${project}`).run(server.conn);
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
