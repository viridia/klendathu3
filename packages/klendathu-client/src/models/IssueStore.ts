import * as LRU from 'lru-cache';
import { ObservableIssue } from './ObservableIssue';
import { session } from '../models';

export class IssueStore {
  private cache: LRU.Cache<string, ObservableIssue>;

  constructor() {
    this.cache = LRU({ max: 1000, dispose: this.onDispose });
  }

  /** Look up an account by it's database id. Returns an observable object which changes in
      response to database mutations. */
  public get(uid: string): ObservableIssue {
    let issue = this.cache.get(uid);
    if (issue) {
      issue.acquire();
      return issue;
    }
    const record = session.connection.record.getRecord(`issue/${uid}`);
    issue = new ObservableIssue(record);
    issue.acquire();
    this.cache.set(uid, issue);
    return issue;
  }

  private onDispose(id: string, issue: ObservableIssue) {
    issue.release();
  }
}

export const issues = new IssueStore();
