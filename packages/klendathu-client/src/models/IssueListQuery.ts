import { session } from './Session';
import { action, IObservableArray, observable } from 'mobx';

export class IssueListQuery {
  @observable public loaded = false;
  @observable public error: string = null;
  @observable public sort: string = 'id';
  @observable public descending: boolean = true;
  @observable.shallow private issues = [] as IObservableArray<string>;
  private list: deepstreamIO.List;

  constructor(account: string, project: string) {
    this.list = session.connection.record.getList(`issues/${account}/${project}`);
    this.list.subscribe(this.onUpdate, true);
  }

  public release() {
    this.list.unsubscribe(this.onUpdate);
    this.list.discard();
  }

  public get length(): number {
    return this.issues.length;
  }

  public get asList(): string[] {
    return this.issues;
  }

  @action.bound
  private onUpdate(elts: string[]) {
    this.issues.replace(elts);
    this.loaded = true;
  }
}
