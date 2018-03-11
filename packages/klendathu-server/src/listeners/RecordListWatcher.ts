import * as r from 'rethinkdb';
import { server } from '../Server';

export interface Change<T> {
  old_val?: T;
  old_offset: number;
  new_val?: T;
  new_offset: number;
  state: string;
}

interface WatchState {
  cursor: r.Cursor;
  list: deepstreamIO.List;
  keys: string[];
  ready: boolean;
}

/** Class which manages lists of active changefeeds which publish changes to deepstream records. */
export class RecordListWatcher<RecordType extends { id?: string }, JSONType> {
  protected encoder: (record: RecordType) => JSONType;
  private queries: Map<string, WatchState> = new Map();

  constructor(encoder: (record: RecordType) => JSONType) {
    this.encoder = encoder;
  }

  public subscribe(listName: string, sequence: r.Sequence) {
    if (!this.queries.has(listName)) {
      sequence
          .changes({
            includeInitial: true,
            includeOffsets: true,
            includeStates: true,
            squash: true } as any)
          .run(server.conn)
          .then(cursor => {
        // Check again - might have added while promise was resolving.
        if (!this.queries.has(listName)) {
          const list = server.deepstream.record.getList(listName);
          const ws: WatchState = {
            cursor,
            list,
            keys: [],
            ready: false,
          };
          this.queries.set(listName, ws);
          cursor.each((err: Error, change: Change<RecordType>) => {
            if (change) {
              this.updateList(change, ws);
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

  public unsubscribe(listName: string) {
    // console.log('not subscribed:', recordName);
    const query = this.queries.get(listName);
    if (query) {
      query.cursor.close();
      query.list.discard();
      this.queries.delete(listName);
    }
  }

  protected updateList(change: Change<RecordType>, ws: WatchState): void {
    console.log(change);
    if (typeof change.old_offset === 'number') {
      ws.keys.splice(change.old_offset, 1);
    }
    if (change.new_val) {
      ws.keys.splice(change.new_offset, 0, change.new_val.id);
    }
    if (change.state === 'ready') {
      ws.ready = true;
    }
    if (ws.ready) {
      ws.list.setEntries(ws.keys);
    }
  }
}
