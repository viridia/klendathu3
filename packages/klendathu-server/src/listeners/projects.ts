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
  private record: deepstreamIO.Record;
  private encoder: (record: RecordType) => JSONType;

  constructor(
      cursor: r.Cursor,
      record: deepstreamIO.Record,
      encoder: (record: RecordType) => JSONType) {
    this.cursor = cursor;
    this.record = record;
    this.encoder = encoder;
    this.cursor.each(this.onChange);
  }

  public close() {
    this.cursor.close();
    this.record.delete();
  }

  @bind
  private onChange(err: Error, change: Change<RecordType>) {
    if (change) {
      if (change.old_val && !change.new_val) {
        this.record.set(change.old_val.id, null);
      } else {
        this.record.set(change.new_val.id, this.encoder(change.new_val));
      }
    }
  }
}

const activeQueries: Map<string, ActiveQuery<ProjectRecord, Project>> = new Map();

ds.record.listen('^projects\?.*', async (eventName, isSubscribed, response) => {
  response.accept();
  if (isSubscribed) {
    const record = ds.record.getRecord(eventName);
    const request = url.parse(eventName, true);
    const query: any = {};
    if (request.query.owner) {
      query.owner = request.query.owner;
    }
    const projectsCursor = await r.table('projects')
        .filter(query)
        .changes({ includeInitial: true, squash: true } as any)
        .run(server.conn);
    if (!activeQueries.get(eventName)) {
      const activeQuery = new ActiveQuery(projectsCursor, record, encodeProject);
      activeQueries.set(eventName, activeQuery);
    }
  } else {
    console.log('not subscribed:', eventName);
    const aq = activeQueries.get(eventName);
    if (aq) {
      aq.close();
    }
  }
});
