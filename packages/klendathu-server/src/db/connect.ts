import * as r from 'rethinkdb';
import { ensureDbsExist, ensureIndicesExist, ensureTablesExist } from './helpers';
import { URL } from 'url';
import { logger } from '../logger';

const ReGrid = require('rethinkdb-regrid'); // tslint:disable-line

const dbUrl = new URL(process.env.RETHINKDB_URL);

export async function connect(): Promise<r.Connection> {
  logger.debug(`Connecting to RethinkDB at host: ${dbUrl.hostname}, port: ${dbUrl.port}`);
  const connection = await r.connect({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port, 10),
  });

  await ensureDbsExist(connection, [process.env.DB_NAME]);
  await ensureTablesExist(connection, process.env.DB_NAME, [
    'accounts',
    'comments',
    'issues',
    'issueChanges',
    'issueLinks',
    'labels',
    'memberships',
    'milestones',
    'projects',
    'projectPrefs',
    'templates',
  ]);
  await ensureIndicesExist(connection, process.env.DB_NAME, {
    issues: [
      'created', 'updated', 'type', 'state', 'summary', 'ownerSort', 'reporterSort',
      'milestone',
    ],
    projects: ['name'],
    accounts: ['uname'],
    labels: ['project'],
    // memberships: ['project', 'user'],
  });
  connection.use(process.env.DB_NAME);

  return connection;
}

export async function connectBucket(): Promise<any> {
  const bucket = ReGrid({
    db: process.env.DB_NAME,
    servers: [{
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port, 10),
    }],
  });
  await bucket.initBucket();
  return bucket;
}
