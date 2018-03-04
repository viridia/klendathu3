import * as LRU from 'lru-cache';
import { Account } from './Account';
import { session } from '../models/Session';

export class AccountStore {
  private cacheById: LRU.Cache<string, Account>;
  private cacheByName: LRU.Cache<string, Account>;

  constructor() {
    this.cacheById = LRU({ max: 100, dispose: this.onDispose });
    this.cacheByName = LRU({ max: 100, dispose: this.onDispose });
  }

  public byId(uid: string): Account {
    let account = this.cacheById.get(uid);
    if (account) {
      account.acquire();
      return account;
    }
    const record = session.connection.record.getRecord(`account/${uid}`);
    account = new Account(record);
    this.cacheById.set(uid, account);
    return account;
  }

  public byName(uname: string): Account {
    let account = this.cacheByName.get(name);
    if (account) {
      account.acquire();
      return account;
    }
    const record = session.connection.record.getRecord(`names/${name}`);
    account = new Account(record);
    this.cacheByName.set(name, account);
    return account;
  }

  private onDispose(id: string, account: Account) {
    account.release();
  }
}
