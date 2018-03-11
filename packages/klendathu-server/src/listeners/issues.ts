import { server } from '../Server';
import { Issue } from 'klendathu-json-types';
import { IssueRecord } from '../db/types';
import { encodeIssue } from '../db/encoders';
// import { escapeRegExp } from '../db/helpers';
import { RecordWatcher } from './RecordWatcher';
import { RecordListWatcher } from './RecordListWatcher';
import * as url from 'url';
import * as r from 'rethinkdb';

const issueListWatcher = new RecordListWatcher<IssueRecord, Issue>(encodeIssue);
const issueWatcher = new RecordWatcher<IssueRecord, Issue>(encodeIssue);

server.deepstream.record.listen('^issues/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const query = url.parse(eventName, true);
    const [, account, project] = query.pathname.split('/', 3);

    // Compute sort key
    let order: r.Sort = { index: r.desc('id') };
    let sortKey: string = query.query.sort as string;
    if (sortKey) {
      let descending = false;
      if (sortKey.startsWith('-')) {
        descending = true;
        sortKey = sortKey.slice(1);
      }
      if (sortKey === 'owner') {
        sortKey = 'ownerSort';
      } else if (sortKey === 'reporter') {
        sortKey = 'reporterSort';
      }
      order = descending ? { index: r.desc(sortKey) } : { index: r.asc(sortKey) };
    }
    // console.log('order', order, eventName);

    // Run database query and set up changefeed.
    issueListWatcher.subscribe(
      eventName,
      r.table('issues')
          .orderBy(order)
          .filter({ project: `${account}/${project}` })
          .pluck('id')
          .limit(10));
  } else {
    issueListWatcher.unsubscribe(eventName);
  }
});

server.deepstream.record.listen('^issue/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const [, account, project, issue] = eventName.split('/', 4);
    issueWatcher.subscribe(eventName, r.table('issues').get(`${account}/${project}/${issue}`));
  } else {
    issueListWatcher.unsubscribe(eventName);
  }
});
