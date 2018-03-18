import { server } from '../Server';
import { Account, Errors } from 'klendathu-json-types';
import { AccountRecord } from '../db/types';
import { logger } from '../logger';
import * as r from 'rethinkdb';

const restrictedNames = new Set([
  'account',
  'settings',
  'organizations',
  'default',
]);

// Get account info for current logged-in user.
server.api.get('/accounts/me', (req, res) => {
  const ar: AccountRecord = req.user as AccountRecord;
  if (!ar) {
    res.status(404).json({});
  }
  const account: Account = {
    uid: ar.id,
    type: ar.type,
    uname: ar.uname,
    display: ar.display,
    photo: ar.photo,
    verified: ar.verified,
    email: ar.email,
  };
  res.json(account);
});

// Get account info for current logged-in user.
server.api.patch('/accounts/me', async (req, res) => {
  const ar: AccountRecord = req.user as AccountRecord;
  if (!ar) {
    res.status(401).end(); // Unauthorized
    return;
  }
  const body: Partial<AccountRecord> = req.body;
  const newAccount: Partial<AccountRecord> = {};
  if (body.display) {
    newAccount.display = body.display;
  }
  if (body.uname) {
    if (restrictedNames.has(body.uname)) {
      res.status(409).json({ error: Errors.EXISTS });
      return;
    } else if (body.uname.length < 5) {
      res.status(409).json({ error: Errors.USERNAME_TOO_SHORT });
      return;
    } else if (body.uname.toLowerCase() !== body.uname) {
      res.status(409).json({ error: Errors.USERNAME_LOWER_CASE });
      return;
    } else if (!body.uname.match(/^[a-z][a-z0-9_\-]+$/)) {
      res.status(409).json({ error: Errors.USERNAME_INVALID_CHARS });
      return;
    }
    newAccount.uname = body.uname;
  }
  if (body.uname && !ar.uname) {
    newAccount.uname = body.uname; // Don't allow username to be changed if already set.
  }
  if (body.email) {
    newAccount.email = body.email;
  }
  if (body.photo) {
    newAccount.photo = body.photo;
  }
  try {
    if (newAccount.uname) {
      const cursor = await r.table('accounts').filter({ uname: newAccount.uname }).run(server.conn);
      const accounts = await cursor.toArray();
      if (accounts.length > 0) {
        res.status(409).json({ error: 'name-exists' });
        return;
      }
    }
    await r.table('accounts').get(ar.id).update(newAccount).run(server.conn);
    logger.info('Updated user account:',
        { userId: ar.id, username: ar.uname, account: newAccount });
    res.end();
  } catch (error) {
    logger.error('Error updating account:',
        { userId: ar.id, username: ar.uname, data: body, message: error.message });
    res.status(500).json({ error: 'internal' });
  }
});
