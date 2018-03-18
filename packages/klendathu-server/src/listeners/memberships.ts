import { server } from '../Server';
import { Membership } from 'klendathu-json-types';
import { MembershipRecord } from '../db/types';
import { encodeMembership } from '../db/encoders';
import { RecordSetWatcher } from './RecordSetWatcher';
import * as url from 'url';
import * as r from 'rethinkdb';

const membershipsWatcher = new RecordSetWatcher<MembershipRecord, Membership>(encodeMembership);

server.deepstream.record.listen('^members/project/.*',
    async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const query = url.parse(eventName, true);
    const [, , account, project] = query.pathname.split('/', 4);
    membershipsWatcher.subscribe(
      eventName,
      r.table('memberships').filter({ project: `${account}/${project}` }));
  } else {
    membershipsWatcher.unsubscribe(eventName);
  }
});

server.deepstream.record.listen('^members/organization/.*',
    async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const query = url.parse(eventName, true);
    const [, , account] = query.pathname.split('/', 3);
    membershipsWatcher.subscribe(
      eventName,
      r.table('memberships').filter({ organization: account }));
  } else {
    membershipsWatcher.unsubscribe(eventName);
  }
});
