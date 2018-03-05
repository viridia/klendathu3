import { Memberships } from './Memberships';
import { Project } from './Project';
import { session } from '../models';

export class ProjectStore {
  /** Look up an account by it's database id. Returns an observable object which changes in
      response to database mutations. */
  public get(account: string, name: string, memberships: Memberships): Project {
    // Rely on deepstream to do the cacheing instead of building our own cacheing layer.
    const record = session.connection.record.getRecord(`project/${account}/${name}`);
    return new Project(record, memberships);
  }
}

export const projects = new ProjectStore();
