import { Project as ProjectData, Role } from 'klendathu-json-types';
import { Memberships } from './Memberships';
import { session } from './Session';
import { Atom, computed } from 'mobx';
import bind from 'bind-decorator';

/** Metadata about a project. */
export class Project {
  private record: deepstreamIO.Record;
  private memberships: Memberships;
  private atom: Atom;

  constructor(record: deepstreamIO.Record, memberships: Memberships) {
    this.record = record;
    this.memberships = memberships;
    this.atom = new Atom(`Project ${this.record.get().id}`);
    this.record.subscribe(this.onUpdate);
  }

  public release() {
    this.record.unsubscribe(this.onUpdate);
  }

  get id(): string {
    return this.data.id;
  }

  get title(): string {
    return this.data.title;
  }

  get description(): string {
    return this.data.description;
  }

  get owner(): string {
    return this.data.owner;
  }

  get template(): string | null {
    return this.data.template;
  }

  get public(): boolean {
    return this.data.isPublic;
  }

  @computed
  get created(): Date {
    return new Date(this.data.created);
  }

  @computed
  get updated(): Date {
    return new Date(this.record.get().data.updated);
  }

  @computed
  get role(): Role {
    const owner = this.data.owner;
    if (session.userId === owner) {
      return Role.OWNER;
    }
    const role = this.memberships.getProjectRole(this.record.get().id);
    const orgRole = this.memberships.getOrganizationRole(owner);
    return Math.max(role, orgRole);
  }

  private get data(): ProjectData {
    this.atom.reportObserved();
    return this.record.get();
  }

  @bind
  private onUpdate(record: deepstreamIO.Record) {
    console.log('Project updated', this.record.get());
    this.atom.reportChanged();
  }
}
