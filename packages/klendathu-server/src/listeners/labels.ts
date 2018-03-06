import { server } from '../Server';
import { Label } from 'klendathu-json-types';
import { LabelRecord } from '../db/types';
import { escapeRegExp } from '../db/helpers';
import { logger } from '../logger';
import { RecordSetWatcher } from './RecordSetWatcher';
import * as r from 'rethinkdb';

const ds = server.deepstream;

function encodeLabel(record: LabelRecord): Label {
  return {
    id: record.id,
    name: record.name,
    color: record.color,
    project: record.project,
    creator: record.creator,
    created: record.created,
    updated: record.updated,
  };
}

const labelListWatcher = new RecordSetWatcher<LabelRecord, Label>(encodeLabel);

server.deepstream.record.listen('^labels/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const [, account, project] = eventName.split('/', 3);
    labelListWatcher.subscribe(
      eventName,
      r.table('labels').filter({ project: `${account}/${project}` }));
  } else {
    labelListWatcher.unsubscribe(eventName);
  }
});

/** Search for a label. */
ds.rpc.provide('labels.search', async (args: any, response: deepstreamIO.RPCResponse) => {
  const { token, account, project, limit = 10 } = args;
  try {
    const pattern = `(?i)\\b${escapeRegExp(token)}`;
    let query: r.Sequence = r.table('labels').filter({ project: `${account}/${project}` });

    // Limit by search token
    query = query.filter((user: any) => user('name').match(pattern));

    // Limit to 10 results
    query = query.orderBy(['name']).limit(limit);

    // Database search
    const cursor = await query.run(server.conn);
    const labels = await cursor.toArray<LabelRecord>();
    response.send(labels.map(encodeLabel));
  } catch (error) {
    logger.error(error.message, { token, account, project, limit });
    response.error('database-error');
  }
});
