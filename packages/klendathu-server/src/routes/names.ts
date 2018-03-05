import { server } from '../Server';
import { Account } from 'klendathu-json-types';
import { AccountRecord } from '../db/types';
import { logger } from '../logger';
import * as r from 'rethinkdb';

// Look up a user or organization by their unique name.
// TODO: This can be better done via RPC.
server.api.get('/names/:name', (req, res) => {
  r.table('accounts').filter({ name: req.params.name }).run(server.conn).then(cursor => {
    cursor.toArray().then(accounts => {
      if (accounts.length === 1) {
        const ar: AccountRecord = accounts[0];
        const account: Account = {
          uid: ar.id,
          type: ar.type,
          uname: ar.uname,
          display: ar.display,
          photo: ar.photo,
        };
        res.json(account);
      } else if (accounts.length === 0) {
        // It's OK to query for a non-existent name, just returns an empty result.
        res.json({});
      } else {
        res.status(500).json({ error: 'duplicate-name', details: { name: req.params.name } });
      }
    }, error => {
      logger.error('Name lookup failed:', error.message);
      res.status(500).json({ error: 'internal' });
    });
  });
});
