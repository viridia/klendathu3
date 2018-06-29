import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
if (process.env.SECRETS_ENV) {
  dotenv.config({ path: process.env.SECRETS_ENV });
}

import { server } from './Server';
import './routes/auth';
import './routes/accounts';
import './routes/files';
import './routes/health';
import './routes/issues';
import './routes/labels';
import './routes/memberships';
import './routes/milestones';
import './routes/names';
import './routes/photo';
import './routes/projects';
import './routes/projectPrefs';
import './routes/version';
import './routes/templates';
import './listeners/accounts';
import './listeners/issues';
import './listeners/labels';
import './listeners/memberships';
import './listeners/milestones';
import './listeners/projects';
import './listeners/projectPrefs';
import './listeners/templates';

server.start();
