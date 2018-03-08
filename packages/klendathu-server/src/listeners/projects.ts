import { server } from '../Server';
import { Project } from 'klendathu-json-types';
import { ProjectRecord } from '../db/types';
import { encodeProject } from '../db/encoders';
import { RecordWatcher } from './RecordWatcher';
import { RecordSetWatcher } from './RecordSetWatcher';
import * as url from 'url';
import * as r from 'rethinkdb';

const ds = server.deepstream;

const projectListWatcher = new RecordSetWatcher<ProjectRecord, Project>(encodeProject);
const projectWatcher = new RecordWatcher<ProjectRecord, Project>(encodeProject);

ds.record.listen('^projects', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const request = url.parse(eventName, true);
    const query: any = {};
    if (request.query.owner) {
      query.owner = request.query.owner;
    }
    // console.log('requesting project list:', eventName);
    projectListWatcher.subscribe(eventName, r.table('projects').filter(query));
  } else {
    projectListWatcher.unsubscribe(eventName);
  }
});

ds.record.listen('^project/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const [, account, uname] = eventName.split('/', 3);
    const pid = `${account}/${uname}`;
    // console.log('requesting project', pid);
    projectWatcher.subscribe(eventName, r.table('projects').get(pid));
  } else {
    // console.log('not subscribed:', eventName);
    projectWatcher.unsubscribe(eventName);
  }
});
