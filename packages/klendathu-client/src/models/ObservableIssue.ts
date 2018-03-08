import { Issue as IssueData, CustomValues } from 'klendathu-json-types';
import { action, Atom, computed, observable } from 'mobx';

/** Represents the displayable info for a user or organization. */
export class ObservableIssue {
  @observable public loaded = false;
  public readonly id: number; // Numeric index of this issue. */

  private record: deepstreamIO.Record;
  private atom: Atom;
  private refCount: number;

  constructor(record: deepstreamIO.Record) {
    this.refCount = 1;
    this.record = record;
    this.atom = new Atom(this.record.name);
    this.id = parseInt(this.record.name.split('/', 4)[3], 10);
    record.subscribe(this.onUpdate, true);
  }

  public acquire() {
    this.refCount += 1;
  }

  public release() {
    this.refCount -= 1;
    if (this.refCount === 0) {
      this.record.unsubscribe(this.onUpdate);
      this.record.discard();
    }
  }

  /** Fully-qualified id. */
  get uid(): string {
    return this.data.id;
  }

  /** Issue type. */
  get type(): string {
    return this.data.type;
  }

  /** Issue state. */
  get state(): string {
    return this.data.state;
  }

  /** Issue summary. */
  get summary(): string {
    return this.data.summary;
  }

  /** Issue description. */
  get description(): string {
    return this.data.description;
  }

  /** Issue reporter. */
  get reporter(): string {
    return this.data.reporter;
  }

  /** Issue owner. */
  get owner(): string {
    return this.data.owner;
  }

  /** Issue cc. */
  get cc(): string[] {
    return this.data.cc;
  }

  /** Issue labels. */
  get labels(): string[] {
    return this.data.labels;
  }

  /** Issue custom fields. */
  get custom(): CustomValues {
    return this.data.custom;
  }

  /** Issue labels. */
  @computed
  get created(): Date {
    return new Date(this.data.created);
  }

  /** Issue labels. */
  @computed
  get updated(): Date {
    return new Date(this.data.updated);
  }

  @action.bound
  private onUpdate(recordData: IssueData) {
    if (recordData.id) {
      this.atom.reportChanged();
      this.loaded = true;
    }
  }

  private get data(): IssueData {
    this.atom.reportObserved();
    return this.record.get();
  }
}
