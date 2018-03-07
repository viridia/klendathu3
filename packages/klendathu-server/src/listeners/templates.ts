import { server } from '../Server';
import { Template } from 'klendathu-json-types';
import { TemplateRecord } from '../db/types';
import { RecordWatcher } from './RecordWatcher';
import * as r from 'rethinkdb';

const encodeTemplate = (record: TemplateRecord) => record as Template;
const templateWatcher = new RecordWatcher<TemplateRecord, Template>(encodeTemplate);

server.deepstream.record.listen('^template/.*', async (eventName, isSubscribed, response) => {
  if (isSubscribed) {
    response.accept();
    const id = eventName.slice(9);
    templateWatcher.subscribe(eventName, r.table('templates').filter({ id }));
  } else {
    templateWatcher.unsubscribe(eventName);
  }
});
