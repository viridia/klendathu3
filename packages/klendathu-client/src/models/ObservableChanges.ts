import { Change } from 'klendathu-json-types';
import { action, computed, observable, IObservableArray } from 'mobx';
import { session } from './Session';

function orderByDate(a: Change, b: Change) {
  if (a.at < b.at) { return -1; }
  if (a.at > b.at) { return 1; }
  return 0;
}

export class ObservableChanges {
  @observable public loaded = true;
  @observable public readonly changes = [] as IObservableArray<Change>;

  private record: deepstreamIO.Record;

  constructor(issueId: string) {
    this.record = session.connection.record.getRecord(`issue.changes/${issueId}`);
    this.record.subscribe(this.onUpdate, true);
  }

  public release() {
    this.record.unsubscribe(this.onUpdate);
    this.record.discard();
  }

  public get length(): number {
    return this.changes.length;
  }

  @computed
  public get sorted(): Change[] {
    return this.changes.sort(orderByDate);
  }

  @action.bound
  private onUpdate(data: { [id: string]: Change }) {
    this.changes.clear();
    for (const id of Object.getOwnPropertyNames(data)) {
      const change = data[id];
      if (change) {
        this.changes.push(change);
      }
    }
    this.loaded = true;
  }
}
