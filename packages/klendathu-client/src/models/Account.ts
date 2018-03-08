import { Account as AccountData } from 'klendathu-json-types';
import { action, Atom, observable } from 'mobx';

/** Represents the displayable info for a user or organization. */
export class Account implements AccountData {
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

  get uid(): string {
    return this.data.uid;
  }

  get uname(): string {
    return this.data.uname;
  }

  get display(): string {
    return this.data.display;
  }

  get type() {
    return this.data.type;
  }

  get photo(): string | null {
    return this.data.photo;
  }

  get verified(): boolean | null {
    return this.data.verified;
  }

  @action.bound
  private onUpdate(record: deepstreamIO.Record) {
    this.atom.reportChanged();
    this.loaded = true;
  }

  private get data(): AccountData {
    this.atom.reportObserved();
    return this.record.get();
  }
}
