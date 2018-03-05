import { server } from '../Server';
import { Project } from 'klendathu-json-types';
import { ProjectRecord } from '../db/types';
import bind from 'bind-decorator';
import * as url from 'url';
import * as r from 'rethinkdb';

const ds = server.deepstream;

interface Change<T> {
  old_val?: T;
  new_val?: T;
}

function encodeProject(record: ProjectRecord): Project {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    owner: record.owner,
    template: record.template,
    isPublic: record.isPublic,
    created: record.created.toJSON(),
    updated: record.updated.toJSON(),
  };
}

class ActiveQuery<RecordType extends { id?: string }, JSONType> {
  private cursor: r.Cursor;
  private recordName: string;
  private encoder: (record: RecordType) => JSONType;
  private single: boolean;

  constructor(
      cursor: r.Cursor,
      recordName: string,
      encoder: (record: RecordType) => JSONType,
      single = false) {
    this.cursor = cursor;
    this.recordName = recordName;
    this.encoder = encoder;
    this.single = single;
    this.cursor.each(this.onChange);
  }

  public close() {
    this.cursor.close();
  }

  @bind
  private onChange(err: Error, change: Change<RecordType>) {
    if (change) {
      if (this.single) {
        // console.log('project change:', change);
        if (change.new_val) {
          (ds.record as any).setData(this.recordName, this.encoder(change.new_val));
        } else {
          (ds.record as any).setData(this.recordName, {});
        }
      } else if (change.old_val && !change.new_val) {
        (ds.record as any).setData(this.recordName, change.old_val.id, null);
      } else {
        (ds.record as any).setData(
            this.recordName, change.new_val.id, this.encoder(change.new_val));
      }
    } else {
      console.log('error change:', err);
    }
  }
}

const activeQueries: Map<string, ActiveQuery<ProjectRecord, Project>> = new Map();

ds.record.listen('^projects', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const request = url.parse(eventName, true);
    const query: any = {};
    if (request.query.owner) {
      query.owner = request.query.owner;
    }
    // console.log('requesting project list:', eventName);
    if (!activeQueries.get(eventName)) {
      const projectsCursor = await r.table('projects')
          .filter(query)
          .changes({ includeInitial: true, squash: true } as any)
          .run(server.conn);
      const activeQuery = new ActiveQuery(projectsCursor, eventName, encodeProject);
      activeQueries.set(eventName, activeQuery);
    }
  } else {
    // console.log('not subscribed:', eventName);
    const aq = activeQueries.get(eventName);
    if (aq) {
      aq.close();
      activeQueries.delete(eventName);
    }
  }
});

ds.record.listen('^project/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const [, account, uname] = eventName.split('/', 3);
    const pid = `${account}/${uname}`;
    // console.log('requesting project', pid);
    if (!activeQueries.get(eventName)) {
      const projectCursor = await r.table('projects')
          .filter({ id: pid })
          .changes({ includeInitial: true, squash: true } as any)
          .run(server.conn);
      const activeQuery = new ActiveQuery(projectCursor, eventName, encodeProject, true);
      activeQueries.set(eventName, activeQuery);
    }
  } else {
    // console.log('not subscribed:', eventName);
    const aq = activeQueries.get(eventName);
    if (aq) {
      aq.close();
      activeQueries.delete(eventName);
    }
  }
});
