import { server } from '../Server';
import { Account } from 'klendathu-json-types';
// import * as url from 'url';

const ds = server.deepstream;

ds.record.listen('^accounts/.*', (eventName, isSubscribed, response) => {
  const record = ds.record.getRecord(eventName);
  if (isSubscribed) {
    response.accept();
    // const params = url.parse(eventName);
    // console.log(params);
    const account: Account = {
      uname: 'example',
      display: 'display',
      type: 'user',
    };
    record.set(account);
    console.log(eventName,  account);
  } else {
    console.log('not subscribed:', eventName);
    // Delete the record
    record.delete();
  }
});
