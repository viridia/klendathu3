import { server } from '../Server';
import { Attachment, Change, Comment, Issue, IssueArc } from 'klendathu-json-types';
import {
  AttachmentRecord,
  IssueChangeRecord,
  CommentRecord,
  IssueRecord,
  IssueLinkRecord,
} from '../db/types';
import {
  encodeIssue,
  encodeComment,
  encodeAttachment,
  encodeIssueLink,
  encodeIssueChange,
} from '../db/encoders';
import { escapeRegExp } from '../db/helpers';
import { RecordWatcher } from './RecordWatcher';
import { RecordListWatcher } from './RecordListWatcher';
import { RecordSetWatcher } from './RecordSetWatcher';
import { logger } from '../logger';
import * as url from 'url';
import * as r from 'rethinkdb';

const ds = server.deepstream;

const issueListWatcher = new RecordListWatcher<IssueRecord, Issue>(encodeIssue);
const issueWatcher = new RecordWatcher<IssueRecord, Issue>(encodeIssue);
const attachmentsWatcher = new RecordSetWatcher<AttachmentRecord, Attachment>(encodeAttachment);
const issueLinksWatcher = new RecordSetWatcher<IssueLinkRecord, IssueArc>(encodeIssueLink);
const commentsWatcher = new RecordSetWatcher<CommentRecord, Comment>(encodeComment);
const changesWatcher = new RecordSetWatcher<IssueChangeRecord, Change>(encodeIssueChange);

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

server.deepstream.record.listen('^issue.links/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const query = url.parse(eventName, true);
    const [, account, project, id] = query.pathname.split('/', 4);
    const issueId = `${account}/${project}/${id}`;
    issueLinksWatcher.subscribe(
      eventName,
      r.table('issueLinks').filter(r.row('from').eq(issueId).or(r.row('to').eq(issueId))));
  } else {
    issueLinksWatcher.unsubscribe(eventName);
  }
});

server.deepstream.record.listen('^comments/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const query = url.parse(eventName, true);
    const [, account, project, id] = query.pathname.split('/', 4);
    commentsWatcher.subscribe(
      eventName,
      r.table('comments').filter({ issue: `${account}/${project}/${id}` }));
  } else {
    commentsWatcher.unsubscribe(eventName);
  }
});

server.deepstream.record.listen('^attachments/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const query = url.parse(eventName, true);
    const [, account, project, id] = query.pathname.split('/', 4);
    attachmentsWatcher.subscribe(
      eventName,
      r.table('attachments').filter({ issue: `${account}/${project}/${id}` }));
  } else {
    attachmentsWatcher.unsubscribe(eventName);
  }
});

server.deepstream.record.listen('^issue.changes/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const query = url.parse(eventName, true);
    const [, account, project, id] = query.pathname.split('/', 4);
    changesWatcher.subscribe(
      eventName,
      r.table('issueChanges').filter({ issue: `${account}/${project}/${id}` }));
  } else {
    changesWatcher.unsubscribe(eventName);
  }
});

/** Search for a label. */
ds.rpc.provide('issues.search', async (args: any, response: deepstreamIO.RPCResponse) => {
  const { token, account, project, limit } = args;
  try {
    const pattern = `(?i)\\b${escapeRegExp(token)}`;
    let query: r.Sequence = r.table('issues').filter({ project: `${account}/${project}` });

    // Limit by search token
    query = query.filter(
        (r.row('summary') as any).match(pattern).or(
        (r.row('description') as any).match(pattern)).or(
        (r.row('reporterSort') as any).match(pattern)).or(
        (r.row('ownerSort') as any).match(pattern))
      );

    // Limit number of results
    if (limit) {
      query = query.orderBy('summary').limit(limit);
    }

    // Database search
    const cursor = await query.run(server.conn);
    const issues = await cursor.toArray<IssueRecord>();
    response.send(issues.map(encodeIssue));
  } catch (error) {
    logger.error(error.message, { token, account, project, limit });
    response.error('database-error');
  }
});
