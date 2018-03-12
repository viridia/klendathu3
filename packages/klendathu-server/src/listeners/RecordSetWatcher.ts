import { server } from '../Server';
import { Change, RecordWatcher } from './RecordWatcher';

/** Similar to RecordWatcher, except that we're watching a collection of database records instead of
    a single record. It will each record as a property on the deepstream record, keyed by database
    id. This is mainly useful when we want to watch a bunch of small records and we don't want
    to use the extra level of indirection for a deepstream list.
*/
export class RecordSetWatcher<RecordType extends { id?: string }, JSONType>
    extends RecordWatcher<RecordType, JSONType> {

  protected updateRecord(recordName: string, change: Change<RecordType>): void {
    // console.log(change);
    if (change.new_val) {
      (server.deepstream.record as any).setData(
        recordName, change.new_val.id, this.encoder(change.new_val));
    } else if (change.old_val) {
      (server.deepstream.record as any).setData(recordName, change.old_val.id, undefined);
    }
  }
}
