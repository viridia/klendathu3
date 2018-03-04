import * as r from 'rethinkdb';
import { ensureDbsExist, ensureIndicesExist, ensureTablesExist } from './helpers';
import { URL } from 'url';
import { logger } from '../logger';

export async function connect(): Promise<r.Connection> {
  const dbUrl = new URL(process.env.RETHINKDB_URL);
  logger.debug(`Connecting to RethinkDB at host: ${dbUrl.hostname}, port: ${dbUrl.port}`);
  const connection = await r.connect({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port, 10),
  });

  await ensureDbsExist(connection, [process.env.DB_NAME]);
  await ensureTablesExist(connection, process.env.DB_NAME, [
    'issues',
    'issueChanges',
    'issueLinks',
    'labels',
    'memberships',
    'projects',
    'projectSettings',
    'templates',
    'accounts',
  ]);
  await ensureIndicesExist(connection, process.env.DB_NAME, {
    projects: ['name'],
    // memberships: ['project', 'user'],
  });
  connection.use(process.env.DB_NAME);

  return connection;
}
// function

// export const connection: r.Connection = ;
