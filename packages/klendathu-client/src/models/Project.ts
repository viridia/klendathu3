import { Project as ProjectData, Role } from 'klendathu-json-types';
import { Memberships } from './Memberships';
import { session } from './Session';
import { action, computed, observable } from 'mobx';

/** Metadata about a project. */
export class Project {
  public readonly account: string;
  public readonly uname: string;
  @observable public title = '';
  @observable public description = '';
  @observable public owner: string = null;
  @observable public isPublic = false;
  @observable public created = new Date();
  @observable public updated = new Date();
  @observable public loaded = false;
  @observable public template: string | null = null;

  private record: deepstreamIO.Record;
  private memberships: Memberships;

  constructor(record: deepstreamIO.Record, memberships: Memberships) {
    this.record = record;
    this.memberships = memberships;

    const [account, uname] = record.name.split('/', 2);
    this.account = account;
    this.uname = uname;
    this.record.subscribe(this.onUpdate);
  }

  public release() {
    this.record.unsubscribe(this.onUpdate);
    this.record.discard();
  }

  @computed
  get role(): Role {
    if (session.userId === this.owner) {
      return Role.OWNER;
    }
    const role = this.memberships.getProjectRole(`${this.account}/${this.uname}`, this.owner);
    const orgRole = this.memberships.getOrganizationRole(this.owner);
    return Math.max(role, orgRole);
  }

  @action.bound
  private onUpdate(data: ProjectData) {
    this.title = data.title;
    this.description = data.description;
    this.owner = data.owner;
    this.template = data.template;
    this.isPublic = data.isPublic;
    this.created = new Date(data.created);
    this.updated = new Date(data.updated);
    this.loaded = true;
  }
}
