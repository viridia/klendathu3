import { Label } from 'klendathu-json-types';
import { action, Atom, computed, observable } from 'mobx';

/** Represents the displayable info for a user or organization. */
export class ObservableLabel implements Label {
  @observable public loaded = false;

  private record: deepstreamIO.Record;
  private atom: Atom;
  private refCount: number;

  constructor(record: deepstreamIO.Record) {
    this.refCount = 1;
    this.record = record;
    this.atom = new Atom(this.record.name);
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
  get id(): string {
    return this.data.id;
  }

  /** Label name. */
  get name(): string {
    return this.data.name;
  }

  /** Label color. */
  get color(): string {
    return this.data.color;
  }

  /** Project this label belongs to. */
  get project(): string {
    return this.data.project;
  }

  /** Label creator. */
  get creator(): string {
    return this.data.creator;
  }

  /** Issue labels. */
  @computed
  get created(): Date {
    return new Date(this.data.created as any as string);
  }

  /** Issue labels. */
  @computed
  get updated(): Date {
    return new Date(this.data.updated as any as string);
  }

  @action.bound
  private onUpdate(recordData: Label) {
    if (recordData.id) {
      this.atom.reportChanged();
      this.loaded = true;
    }
  }

  private get data(): Label {
    this.atom.reportObserved();
    return this.record.get();
  }
}
