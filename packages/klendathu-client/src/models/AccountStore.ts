import * as LRU from 'lru-cache';
import { Account } from 'klendathu-json-types';
import { ObservableAccount } from './ObservableAccount';
import { session } from '../models';

export class AccountStore {
  private cacheById: LRU.Cache<string, ObservableAccount>;
  private cacheByName: LRU.Cache<string, Account>;

  constructor() {
    this.cacheById = LRU({ max: 100, dispose: this.onDispose });
    this.cacheByName = LRU({ max: 100 });
  }

  /** Look up an account by it's database id. Returns an observable object which changes in
      response to database mutations. */
  public byId(uid: string): ObservableAccount {
    let account = this.cacheById.get(uid);
    if (account) {
      account.acquire();
      return account;
    }
    const record = session.connection.record.getRecord(`accounts/${uid}`);
    account = new ObservableAccount(record);
    account.acquire();
    this.cacheById.set(uid, account);
    return account;
  }

  /** Look up an account by it's public name. Returns a raw JSON object. This is a
      low-overhead method which does a single deepstream RPC call. */
  public byName(uname: string): Promise<Account> {
    return new Promise((resolve, reject) => {
      const account = this.cacheByName.get(uname);
      if (account) {
        resolve(account);
        return;
      }
      session.connection.rpc.make('accounts.get', { uname }, (error, resp) => {
        if (error) {
          reject(new Error(error));
        } else {
          this.cacheByName.set(uname, resp);
          resolve(resp);
        }
      });
    });
  }

  private onDispose(id: string, account: ObservableAccount) {
    account.release();
  }
}

export const accounts = new AccountStore();
