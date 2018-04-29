import { server } from '../Server';
import * as r from 'rethinkdb';

// Health check
server.api.get('/api/health', (req, res) => {
  r.table('issues').count().run(server.conn).then(() => {
    res.end();
  }, error => {
    res.status(500).end();
  });
});
