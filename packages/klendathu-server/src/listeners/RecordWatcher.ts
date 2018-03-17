import * as r from 'rethinkdb';
import { server } from '../Server';

export interface Change<T> {
  old_val?: T;
  new_val?: T;
}

/** Class which manages lists of active changefeeds which publish changes to deepstream records. */
export class RecordWatcher<RecordType extends { id?: string }, JSONType> {
  protected encoder: (record: RecordType) => JSONType;
  private queries: Map<string, r.Cursor> = new Map();

  constructor(encoder: (record: RecordType) => JSONType) {
    this.encoder = encoder;
  }

  public subscribe(recordName: string, sequence: r.Sequence | r.Operation<r.Cursor>) {
    if (!this.queries.has(recordName)) {
      (sequence as r.Sequence)
          .changes({ includeInitial: true, squash: true } as any)
          .run(server.conn)
          .then(cursor => {
        // Check again - might have added while promise was resolving.
        if (!this.queries.has(recordName)) {
          this.queries.set(recordName, cursor);
          cursor.each((err: Error, change: Change<RecordType>) => {
            if (change) {
              this.updateRecord(recordName, change);
            } else {
              // TODO: Figure out how to handle the error.
              console.log('error change:', err);
            }
          });
        } else {
          cursor.close();
        }
      });
    }
  }

  public unsubscribe(recordName: string) {
    // console.log('not subscribed:', recordName);
    const query = this.queries.get(recordName);
    if (query) {
      query.close();
      this.queries.delete(recordName);
    }
  }

  protected updateRecord(recordName: string, change: Change<RecordType>): void {
    // console.log('change:', recordName, change);
    if (change.new_val) {
      (server.deepstream.record as any).setData(recordName, this.encoder(change.new_val));
    } else {
      (server.deepstream.record as any).setData(recordName, {});
    }
  }
}
