import * as express from 'express';
import * as http from 'http';
import * as deepstream from 'deepstream.io-client-js';
import * as bodyParser from 'body-parser';
import * as r from 'rethinkdb';
import { logger } from './logger';
import { connect, connectBucket } from './db/connect';

export class Server {
  public httpServer: http.Server;
  public express: express.Application;
  public logErrors: boolean;
  public api: express.Router;
  public deepstream: deepstreamIO.Client;
  public conn: r.Connection;
  public bucket: any;

  constructor() {
    this.logErrors = true;
    this.express = express();
    this.api = express.Router();
    this.express.use(bodyParser.json());
    this.express.use('/api', this.api);

    this.deepstream = deepstream(process.env.DEEPSTREAM_URL);
    this.deepstream.on('connectionStateChanged', connectionState => {
      if (connectionState === 'OPEN') {
        logger.debug('Deepstream connection open.');
      }
    });
    this.deepstream.on('error', (error, event, topic) => {
      logger.error('Deepstream connection error:', error, event, topic);
    });
  }

  public async start() {
    const port = parseInt(process.env.KDT_SERVER_PORT, 10) || 80;
    this.conn = await connect();
    this.bucket = await connectBucket();
    this.httpServer = this.express.listen(port, () => {
      // Since Deepstream calls us back for authentication, wait until we are listening.
      this.deepstream.login({ Authorization: `Token ${process.env.SERVER_AUTH_SECRET}` });
    });
    logger.info('KDT server listening on port', port);
  }

  public stop() {
    this.httpServer.close();
    this.deepstream.close();
  }
}

export const server = new Server();
