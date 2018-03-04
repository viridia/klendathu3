import { server } from '../Server';

// Get version
server.api.get('/version', (req, res) => {
  res.json({ version: process.env.npm_package_version });
});
