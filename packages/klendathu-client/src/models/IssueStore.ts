import * as LRU from 'lru-cache';
import { Issue } from './Issue';
import { session } from '../models';

export class IssueStore {
  private cache: LRU.Cache<string, Issue>;

  constructor() {
    this.cache = LRU({ max: 1000, dispose: this.onDispose });
  }

  /** Look up an account by it's database id. Returns an observable object which changes in
      response to database mutations. */
  public get(uid: string): Issue {
    let issue = this.cache.get(uid);
    if (issue) {
      issue.acquire();
      return issue;
    }
    const record = session.connection.record.getRecord(`issue/${uid}`);
    issue = new Issue(record);
    issue.acquire();
    this.cache.set(uid, issue);
    return issue;
  }

  private onDispose(id: string, issue: Issue) {
    issue.release();
  }
}

export const issues = new IssueStore();
