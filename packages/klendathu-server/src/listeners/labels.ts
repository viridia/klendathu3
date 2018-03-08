import { server } from '../Server';
import { Label } from 'klendathu-json-types';
import { LabelRecord } from '../db/types';
import { escapeRegExp } from '../db/helpers';
import { encodeLabel } from '../db/encoders';
import { logger } from '../logger';
import { RecordWatcher } from './RecordWatcher';
import { RecordSetWatcher } from './RecordSetWatcher';
import * as r from 'rethinkdb';

const ds = server.deepstream;

const labelListWatcher = new RecordSetWatcher<LabelRecord, Label>(encodeLabel);
const labelWatcher = new RecordWatcher<LabelRecord, Label>(encodeLabel);

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

server.deepstream.record.listen('^label/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const [, account, project, id] = eventName.split('/', 4);
    labelWatcher.subscribe(eventName, r.table('labels').get(`${account}/${project}/${id}`));
  } else {
    labelWatcher.unsubscribe(eventName);
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
