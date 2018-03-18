import { Membership } from 'klendathu-json-types';
import { action, observable, IObservableArray } from 'mobx';
import { session } from './Session';

export class ObservableMemberList {
  @observable public loaded = true;
  @observable public readonly members = [] as IObservableArray<Membership>;

  private record: deepstreamIO.Record;

  constructor(scopeType: 'project' | 'organization', scope: string) {
    this.record = session.connection.record.getRecord(`members/${scopeType}/${scope}`);
    this.record.subscribe(this.onUpdate, true);
  }

  public release() {
    this.record.unsubscribe(this.onUpdate);
    this.record.discard();
  }

  public get length(): number {
    return this.members.length;
  }

  @action.bound
  private onUpdate(data: { [id: string]: Membership }) {
    this.members.clear();
    for (const id of Object.getOwnPropertyNames(data)) {
      const member = data[id];
      if (member) {
        this.members.push(member);
      }
    }
    this.loaded = true;
  }
}
