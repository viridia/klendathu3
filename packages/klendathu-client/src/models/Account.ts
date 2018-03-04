import { Account as AccountData } from 'klendathu-json-types';
import { observable } from 'mobx';

/** Represents the displayable info for a user or organization. */
export class Account {
  @observable public loading = true;
  @observable public loaded = false;
  public readonly uid: string;

  @observable.ref private data: AccountData;
  private record: deepstreamIO.Record;
  private refCount: number;

  constructor(record: deepstreamIO.Record) {
    this.refCount = 1;
    this.record = record;
    record.subscribe(this.update);
    this.data = record.get() as AccountData;
  }

  public acquire() {
    this.refCount += 1;
  }

  public release() {
    this.refCount -= 1;
    if (this.refCount === 0) {
      this.record.discard();
    }
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

  public update(record: deepstreamIO.Record) {
    this.data = record.get() as AccountData;
    console.log('updated account:', this.data);
  }
}
