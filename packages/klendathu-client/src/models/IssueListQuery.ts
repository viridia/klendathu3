import { session } from './Session';
import { action, computed, IObservableArray, observe, observable } from 'mobx';
import bind from 'bind-decorator';
import * as qs from 'qs';

function alphabeticalSort(a: string, b: string) {
  return a.localeCompare(b);
}

export class IssueListQuery {
  @observable public loaded = false;
  @observable public error: string = null;
  @observable public sort: string = 'id';
  @observable public descending: boolean = true;
  @observable.shallow private issues = [] as IObservableArray<string>;
  private account: string;
  private project: string;
  private list: deepstreamIO.List;

  constructor(account: string, project: string) {
    this.account = account;
    this.project = project;
    observe(this, 'queryParams', this.onChangeQueryParams, true);
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

  @computed
  private get queryParams(): string {
    const query: any = {};
    if (this.sort) {
      if (this.sort !== 'id' || !this.descending) {
        query.sort = `${this.descending ? '-' : ''}${this.sort}`;
      }
    }
    return qs.stringify(query, { addQueryPrefix: true, sort: alphabeticalSort });
  }

  @action.bound
  private onUpdate(elts: string[]) {
    console.log('num records:', elts.length);
    this.issues.replace(elts);
    this.loaded = true;
  }

  @bind
  private onChangeQueryParams() {
    if (this.list) {
      this.release();
    }
    const newList = session.connection.record.getList(
      `issues/${this.account}/${this.project}${this.queryParams}`);
    this.list = newList;
    this.list.subscribe(this.onUpdate, true);
  }
}
