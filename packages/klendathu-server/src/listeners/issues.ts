import { server } from '../Server';
import { Issue } from 'klendathu-json-types';
import { IssueRecord } from '../db/types';
// import { escapeRegExp } from '../db/helpers';
import { RecordWatcher } from './RecordWatcher';
import { RecordListWatcher } from './RecordListWatcher';
import * as url from 'url';
import * as r from 'rethinkdb';

function encodeIssue(record: IssueRecord): Issue {
  return {
    id: record.id,
    project: record.project,
    type: record.type,
    state: record.state,
    summary: record.summary,
    description: record.description,
    reporter: record.reporter,
    owner: record.owner,
    cc: record.cc,
    created: record.created.toJSON(),
    updated: record.updated.toJSON(),
    labels: record.labels,
    custom: record.custom,
    isPublic: record.isPublic,
  };
}

const issueListWatcher = new RecordListWatcher<IssueRecord, Issue>(encodeIssue);
const issueWatcher = new RecordWatcher<IssueRecord, Issue>(encodeIssue);

server.deepstream.record.listen('^issues/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const query = url.parse(eventName);
    const [, account, project] = query.pathname.split('/', 3);
    issueListWatcher.subscribe(
      eventName,
      r.table('issues')
          .orderBy({ index: r.desc('id') })
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
    issueWatcher.subscribe(
      eventName,
      r.table('issues').get(`${account}/${project}/${issue}`) as any);
  } else {
    issueListWatcher.unsubscribe(eventName);
  }
});
