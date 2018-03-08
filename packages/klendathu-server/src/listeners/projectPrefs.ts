import { server } from '../Server';
import { ProjectPrefs } from 'klendathu-json-types';
import { ProjectPrefsRecord } from '../db/types';
import { encodeProjectPrefs } from '../db/encoders';
import { RecordWatcher } from './RecordWatcher';
import * as r from 'rethinkdb';

const ds = server.deepstream;

const projectPrefsWatcher = new RecordWatcher<ProjectPrefsRecord, ProjectPrefs>(encodeProjectPrefs);

ds.record.listen('^project-prefs/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const [, account, project, user] = eventName.split('/', 4);
    const pid = `${account}/${project}/${user}`;
    projectPrefsWatcher.subscribe(eventName, r.table('projectPrefs').get(pid));
  } else {
    projectPrefsWatcher.unsubscribe(eventName);
  }
});
