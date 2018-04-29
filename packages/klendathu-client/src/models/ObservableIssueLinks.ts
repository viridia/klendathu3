import { IssueArc, Relation, inverseRelations } from 'klendathu-json-types';
import { action, observable, ObservableMap } from 'mobx';
import { session } from './Session';

// TODO: Sort

export class ObservableIssueLinks {
  @observable public loaded = false;
  @observable public readonly map = new ObservableMap<Relation>();

  private issueId: string;
  private record: deepstreamIO.Record;

  constructor(issueId: string) {
    this.issueId = issueId;
    this.record = session.connection.record.getRecord(`issue.links/${issueId}`);
    this.record.subscribe(this.onUpdate, true);
  }

  public release() {
    this.record.unsubscribe(this.onUpdate);
    this.record.discard();
  }

  public get linkMap(): Map<string, Relation> {
    return this.map as any;
  }

  public get size(): number {
    return this.map.size;
  }

  @action.bound
  private onUpdate(data: { [id: string]: IssueArc }) {
    const map = new Map<string, Relation>();
    for (const id of Object.getOwnPropertyNames(data)) {
      const link = data[id];
      if (link) {
        if (link.to === this.issueId) {
          map.set(link.from, inverseRelations[link.relation]);
        } else {
          map.set(link.to, link.relation);
        }
      }
    }
    this.map.replace(map);
    this.loaded = true;
  }
}
