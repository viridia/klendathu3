import { server } from '../Server';
import { Milestone } from 'klendathu-json-types';
import { MilestoneRecord } from '../db/types';
import { escapeRegExp } from '../db/helpers';
import { encodeMilestone } from '../db/encoders';
import { logger } from '../logger';
import { RecordWatcher } from './RecordWatcher';
import { RecordSetWatcher } from './RecordSetWatcher';
import * as r from 'rethinkdb';

const ds = server.deepstream;

const milestoneListWatcher = new RecordSetWatcher<MilestoneRecord, Milestone>(encodeMilestone);
const milestoneWatcher = new RecordWatcher<MilestoneRecord, Milestone>(encodeMilestone);

server.deepstream.record.listen('^milestones/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const [, account, project] = eventName.split('/', 3);
    milestoneListWatcher.subscribe(
      eventName,
      r.table('milestones').filter({ project: `${account}/${project}` }));
  } else {
    milestoneListWatcher.unsubscribe(eventName);
  }
});

server.deepstream.record.listen('^milestone/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const [, id] = eventName.split('/', 4);
    milestoneWatcher.subscribe(eventName, r.table('milestones').get(id));
  } else {
    milestoneWatcher.unsubscribe(eventName);
  }
});

/** Search for a milestone. */
ds.rpc.provide('milestones.search', async (args: any, response: deepstreamIO.RPCResponse) => {
  const { token, account, project, limit = 10 } = args;
  try {
    const pattern = `(?i)\\b${escapeRegExp(token)}`;
    let query: r.Sequence = r.table('milestones').filter({ project: `${account}/${project}` });

    // Limit by search token
    query = query.filter((ms: any) => ms('name').match(pattern));

    // Limit to 10 results
    query = query.orderBy('name').limit(limit);

    // Database search
    const cursor = await query.run(server.conn);
    const milestones = await cursor.toArray<MilestoneRecord>();
    response.send(milestones.map(encodeMilestone));
  } catch (error) {
    logger.error(error.message, { token, account, project, limit });
    response.error('database-error');
  }
});
