import { server } from '../Server';
import { Account } from 'klendathu-json-types';
import { AccountRecord } from '../db/types';
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
  }

  @bind
  private onChange(err: Error, change: Change<RecordType>) {
    if (change) {
      if (change.old_val && !change.new_val) {
        this.record.delete();
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
    const projectsCursor = await r.table('accounts')
        .filter({ id })
        .changes({ includeInitial: true, squash: true } as any)
        .run(server.conn);
    if (!activeQueries.get(eventName)) {
      const activeQuery = new ActiveQuery(projectsCursor, record, encodeAccount);
      activeQueries.set(eventName, activeQuery);
    }
  } else {
    console.log('not subscribed:', eventName);
    const aq = activeQueries.get(eventName);
    if (aq) {
      aq.close();
      activeQueries.delete(eventName);
    }
  }
});
