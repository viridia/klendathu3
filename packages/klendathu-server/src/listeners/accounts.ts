import { server } from '../Server';
import { Account } from 'klendathu-json-types';
import { AccountRecord } from '../db/types';
import { escapeRegExp } from '../db/helpers';
import { logger } from '../logger';
import * as r from 'rethinkdb';
import bind from 'bind-decorator';

const ds = server.deepstream;

interface Change<T> {
  old_val?: T;
  new_val?: T;
}

function encodeAccount(record: AccountRecord): Account {
  return {
    uid: record.id,
    uname: record.uname,
    display: record.display,
    photo: record.photo,
    type: record.type,
  };
}

class ActiveQuery<RecordType extends { id?: string }, JSONType> {
  private cursor: r.Cursor;
  private record: deepstreamIO.Record;
  private encoder: (record: RecordType) => JSONType;

  constructor(
      cursor: r.Cursor,
      record: deepstreamIO.Record,
      encoder: (record: RecordType) => JSONType) {
    this.cursor = cursor;
    this.record = record;
    this.encoder = encoder;
    this.cursor.each(this.onChange);
  }

  public close() {
    this.cursor.close();
    this.record.delete();
  }

  @bind
  private onChange(err: Error, change: Change<RecordType>) {
    if (change) {
      if (change.old_val && !change.new_val) {
        this.record.set({});
      } else {
        this.record.set(this.encoder(change.new_val));
      }
    }
  }
}

const activeQueries: Map<string, ActiveQuery<AccountRecord, Account>> = new Map();

ds.record.listen('^accounts/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const record = ds.record.getRecord(eventName);
    const id = eventName.split('/', 2)[1];
    if (!activeQueries.get(eventName)) {
      const projectsCursor = await r.table('accounts')
          .filter({ id })
          .changes({ includeInitial: true, squash: true } as any)
          .run(server.conn);
      const activeQuery = new ActiveQuery(projectsCursor, record, encodeAccount);
      activeQueries.set(eventName, activeQuery);
    }
  } else {
    // console.log('not subscribed:', eventName);
    const aq = activeQueries.get(eventName);
    if (aq) {
      aq.close();
      activeQueries.delete(eventName);
    }
  }
});

/** Lookup an account by uname. */
ds.rpc.provide('accounts.get', async (args: any, response: deepstreamIO.RPCResponse) => {
  const { uname, uid } = args;
  try {
    if (uid) {
      const account = await r.table('accounts').get<AccountRecord>(uid).run(server.conn);
      response.send(account ? encodeAccount(account) : {});
      return;
    }
    let query: r.Sequence = r.table('accounts');
    if (uname) {
      query = query.filter({ uname });
    }
    query = query.limit(2);
    const cursor = await query.run(server.conn);
    const accounts = await cursor.toArray<AccountRecord>();
    if (accounts.length === 1) {
      response.send(encodeAccount(accounts[0]));
    } else if (accounts.length === 0) {
      response.send({});
    } else {
      response.error('multiple-accounts');
    }
  } catch (error) {
    response.error('database-error');
  }
});

/** Search for an account. */
// TODO: Provide a search function for project members only.
ds.rpc.provide('accounts.search', async (args: any, response: deepstreamIO.RPCResponse) => {
  const { token, type, limit = 10 } = args;
  try {
    const pattern = `(?i)\\b${escapeRegExp(token)}`;
    let query: r.Sequence = r.table('users');

    // Limit by type
    if (type) {
      query = query.filter({ type });
    }

    // Limit by search token
    query = query.filter((user: any) => {
      return user('display').match(pattern) || user('uname').match(pattern);
    });

    // Limit to 10 results
    query = query.orderBy(['display', 'uname']).limit(limit);

    // Database search
    const cursor = await query.run(server.conn);
    const accounts = await cursor.toArray<AccountRecord>();
    response.send(accounts.map(encodeAccount));
  } catch (error) {
    logger.error(error.message, { token, type });
    response.error('database-error');
  }
});
