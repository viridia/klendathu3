import { server } from '../Server';
import { Account } from 'klendathu-json-types';
import { AccountRecord } from '../db/types';
import { escapeRegExp } from '../db/helpers';
import { encodeAccount } from '../db/encoders';
import { logger } from '../logger';
import { RecordWatcher } from './RecordWatcher';
import * as r from 'rethinkdb';

const ds = server.deepstream;

const accountWatcher = new RecordWatcher<AccountRecord, Account>(encodeAccount);

ds.record.listen('^accounts/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const id = eventName.split('/', 2)[1];
    accountWatcher.subscribe(eventName, r.table('accounts').get(id));
  } else {
    accountWatcher.unsubscribe(eventName);
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
    let query: r.Sequence = r.table('accounts');

    // Limit by type
    if (type) {
      query = query.filter({ type });
    }

    // Limit by search token
    query = query.filter(
        (r.row('display') as any).match(pattern).or(
        (r.row('uname') as any).match(pattern)).or(
        (r.row('email') as any).match(pattern))
      );

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
