import { server } from '../Server';
import { Attachment, Change, Comment, Issue, IssueArc, Predicate } from 'klendathu-json-types';
import {
  IssueChangeRecord,
  CommentRecord,
  IssueRecord,
  IssueLinkRecord,
} from '../db/types';
import {
  encodeIssue,
  encodeComment,
  encodeIssueLink,
  encodeIssueChange,
} from '../db/encoders';
import { escapeRegExp, zeroOrOne } from '../db/helpers';
import { RecordWatcher } from './RecordWatcher';
import { RecordListWatcher } from './RecordListWatcher';
import { RecordSetWatcher } from './RecordSetWatcher';
import { logger } from '../logger';
import * as url from 'url';
import * as r from 'rethinkdb';

const ds = server.deepstream;

const issueListWatcher = new RecordListWatcher<IssueRecord, Issue>(encodeIssue);
const issueWatcher = new RecordWatcher<IssueRecord, Issue>(encodeIssue);
const issueLinksWatcher = new RecordSetWatcher<IssueLinkRecord, IssueArc>(encodeIssueLink);
const commentsWatcher = new RecordSetWatcher<CommentRecord, Comment>(encodeComment);
const changesWatcher = new RecordSetWatcher<IssueChangeRecord, Change>(encodeIssueChange);

function toScalar(value: string | string[]): string {
  if (typeof value === 'string') {
    return value;
  } else {
    return value[0];
  }
}

function toArray(value: string | string[]): string[] {
  if (typeof value === 'string') {
    return [value];
  } else {
    return value;
  }
}

function stringPredicate(
    field: r.Expression<string>,
    pred: string | string[],
    value: string | string[]): r.Expression<boolean> {
  switch (pred) {
    case Predicate.CONTAINS:
      return (field as any).match(`(?i)${escapeRegExp(toScalar(value))}`);
    case Predicate.EQUALS:
      return field.eq(toScalar(value));
    case Predicate.NOT_CONTAINS:
      return (field as any).match(`(?i)${escapeRegExp(toScalar(value))}`).not();
    case Predicate.NOT_EQUALS:
      return field.ne(toScalar(value));
    case Predicate.STARTS_WITH:
      return (field as any).match(`^(?i)${escapeRegExp(toScalar(value))}`);
    case Predicate.ENDS_WITH:
      return (field as any).match(`(?i)${escapeRegExp(toScalar(value))}$`);
    case Predicate.IN: {
      const values = toArray(value);
      return values.reduce((expr: r.Expression<boolean>, v) => {
        const term = field.eq(v);
        return expr ? expr.or(term) : term;
      }, null);
    }

    default:
      logger.error('Invalid string predicate:', pred);
      return null;
  }
}

async function lookupUsers(users: string | string[]): Promise<string[]> {
  const unames = toArray(users);
  const accounts = await Promise.all(unames.map(uname => {
    return r.table('accounts').filter({ uname }).run(server.conn).then(zeroOrOne<Account>());
  }));
  return accounts.filter(a => a).map(a => a.id);
}

server.deepstream.record.listen('^issues/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const topicUrl = url.parse(eventName, true);
    const [, account, project] = topicUrl.pathname.split('/', 3);

    // Compute sort key
    let order: r.Sort = { index: r.desc('id') };
    let sortKey: string = topicUrl.query.sort as string;
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

    let dbQuery = r.table('issues')
        .orderBy(order)
        .filter({ project: `${account}/${project}` });

    // Build the query expression
    const filters: Array<r.Expression<boolean>> = [];

    // If they are not a project member, only allow public issues to be viewed.
    // TODO: This doesn't work because we don't have access to 'role' in deepstream listeners.
    // if (role < Role.VIEWER) {
    //   filters.push(r.row('isPublic'));
    // }

    const args = topicUrl.query;
    // console.log(args);

    // Search by token
    if (args.search) {
      const re = `(?i)\\b${escapeRegExp(toScalar(args.search.toString()))}`;
      filters.push((r as any).or(
        (r.row('summary') as any).match(re),
        (r.row('description') as any).match(re),
        // TODO: other fields - comments, etc.
      ));
    }

    // By Type
    if (args.type) {
      const types = toArray(args.type);
      if (types.length === 1) {
        filters.push(r.row('type').eq(types[0]));
      } else {
        filters.push((r.row('type') as any).do((type: string) => r.expr(types).contains(type)));
      }
    }

    // By State
    if (args.state) {
      const states = toArray(args.state);
      if (states.length === 1) {
        filters.push(r.row('state').eq(states[0]));
      } else {
        filters.push((r.row('state') as any).do((state: string) => r.expr(states).contains(state)));
      }
    }

    // By Summary
    if (args.summary) {
      const test = stringPredicate(r.row('summary'), args.summaryPred, args.summary);
      if (test) {
        filters.push(test);
      }
    }

    // By Description
    if (args.description) {
      const test = stringPredicate(r.row('description'), args.descriptionPred, args.description);
      if (test) {
        filters.push(test);
      }
    }

    // By Reporter
    if (args.reporter) {
      const users = await lookupUsers(args.reporter);
      filters.push((r.row('reporter') as any)
          .do((reporter: string) => r.expr(users).contains(reporter)));
    }

    // By Owner
    if (args.owner) {
      const users = await lookupUsers(args.owner);
      filters.push((r.row('owner') as any)
          .do((owner: string) => r.expr(users).contains(owner)));
    }

    // Match any label
    if (args.labels) {
      const labels = toArray(args.labels).map(l => `${account}/${project}/${l}`);
      if (labels) {
        const e = labels.reduce((expr: r.Expression<boolean>, label) => {
          const term = r.row('labels').contains(label);
          return expr ? expr.or(term) : term;
        }, null);
        if (e) {
          filters.push(e);
        }
      }
    }

    // Match any cc
    if (args.cc) {
      const cc = await lookupUsers(args.cc);
      if (cc) {
        const e = cc.reduce((expr: r.Expression<boolean>, uid) => {
          const term = r.row('cc').contains(uid);
          return expr ? expr.or(term) : term;
        }, null);
        if (e) {
          filters.push(e);
        }
      }
    }

    // Other things we might want to search by:
    // comments / commenter
    // created (date range)
    // updated

    for (const key in args) {
      if (key.startsWith('custom.')) {
        const fieldId = key.slice(7);
        const pred = args[`pred.${fieldId}`] as Predicate || Predicate.CONTAINS;
        const expr = stringPredicate(r.row('custom')(fieldId), pred, args[key]);
        if (expr) {
          // console.log(expr.toString());
          filters.push(expr);
        }
      }
    }

    if (filters.length > 0) {
      dbQuery = dbQuery.filter((r as any).and(...filters));
    }

    // Run database query and set up changefeed.
    issueListWatcher.subscribe(
      eventName,
      dbQuery.pluck('id').limit(50));
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

server.deepstream.record.listen('^issue.changes/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const query = url.parse(eventName, true);
    const [, account, project, id] = query.pathname.split('/', 4);
    if (!id) {
      changesWatcher.subscribe(
        eventName,
        r.table('issueChanges').filter({ project: `${account}/${project}` }));
    } else {
      changesWatcher.subscribe(
        eventName,
        r.table('issueChanges').filter({ issue: `${account}/${project}/${id}` }));
    }
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

/** Look up an attachment. */
ds.rpc.provide('file.info', async (args: any, response: deepstreamIO.RPCResponse) => {
  const { id } = args;
  try {
    const record = await server.bucket.getFile({ filename: id });
    const attachment: Attachment = {
      id,
      url: `/api/file/${id}`,
      filename: record.metadata.filename,
      thumbnail: record.metadata.thumb ? `/api/file/${id}-thumb` : undefined,
      type: record.metadata.contentType,
    };
    response.send(attachment);
  } catch (error) {
    logger.error(error.message, { id });
    response.error('database-error');
  }
});

/** Look up an array of attachments by id. */
ds.rpc.provide('file.info.list', async (args: string[], response: deepstreamIO.RPCResponse) => {
  const attachments: Attachment[] = await Promise.all(args.map(async id => {
    try {
      const record = await server.bucket.getFile({ filename: id });
      const attachment: Attachment = {
        id,
        url: `/api/file/${id}`,
        filename: record.metadata.filename,
        thumbnail: record.metadata.thumb ? `/api/file/${id}-thumb` : undefined,
        type: record.metadata.contentType,
      };
      return attachment;
    } catch (error) {
      logger.error(error.message, { id });
      return null;
    }
  }));
  response.send(attachments.filter(a => a));
});
