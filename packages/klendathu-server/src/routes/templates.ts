import * as Ajv from 'ajv';
import { Role } from 'klendathu-json-types';
import { server } from '../Server';
import { logger } from '../logger';
import { AccountRecord } from '../db/types';
import { getAccountAndRole } from '../db/userRole';
import * as r from 'rethinkdb';

import * as templateSchema from '../../json-schema/template.schema.json';

const ajv = Ajv();
const templateValidator = ajv.compile(templateSchema);

// Store a template.
server.api.put('/account/:account/templates/:template', async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;
  const { account, template }: { account: string, template: string } = req.params;
  const role = await getAccountAndRole(account, user);
  if (role < Role.ADMINISTRATOR) {
    logger.error('No permission to modify template:', { account, user: user.uname });
    res.status(403).json({ error: 'forbidden' });
    return;
  }

  if (!templateValidator(req.body)) {
    // TODO: Decode and transform into error objects.
    res.status(400).json({ error: 'schema-validation', details: templateValidator.errors });
    logger.error('Schema validation failure:', { account, user: user.uname });
    console.error('Schema validation failure:', req.body, templateValidator.errors);
  } else {
    const templateRecord = {
      id: `${account}/${template}`,
      ...req.body,
    };
    await r.table('templates').get(templateRecord.id).replace(templateRecord).run(server.conn);
    res.end();
  }
});
