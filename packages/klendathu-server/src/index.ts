import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { server } from './Server';
import './routes/auth';
import './routes/accounts';
import './routes/names';
import './routes/projects';
import './routes/version';
import './routes/templates';
import './listeners/accounts';
import './listeners/projects';
import './listeners/templates';

server.start();
