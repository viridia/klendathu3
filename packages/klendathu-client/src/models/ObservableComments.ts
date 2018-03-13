import { Comment } from 'klendathu-json-types';
import { action, computed, observable, IObservableArray } from 'mobx';
import { session } from './Session';

function orderByCreated(a: Comment, b: Comment) {
  if (a.created < b.created) { return -1; }
  if (a.created > b.created) { return 1; }
  return 0;
}

export class ObservableComments {
  @observable public loaded = true;
  @observable public readonly comments = [] as IObservableArray<Comment>;

  private record: deepstreamIO.Record;

  constructor(issueId: string) {
    this.record = session.connection.record.getRecord(`comments/${issueId}`);
    this.record.subscribe(this.onUpdate, true);
  }

  public release() {
    this.record.unsubscribe(this.onUpdate);
    this.record.discard();
  }

  public get length(): number {
    return this.comments.length;
  }

  @computed
  public get sorted(): Comment[] {
    return this.comments.sort(orderByCreated);
  }

  @action.bound
  private onUpdate(data: { [id: string]: Comment }) {
    this.comments.clear();
    for (const id of Object.getOwnPropertyNames(data)) {
      const comment = data[id];
      if (comment) {
        this.comments.push(comment);
      }
    }
    this.loaded = true;
  }
}
