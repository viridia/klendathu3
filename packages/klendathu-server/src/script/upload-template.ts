import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Ajv from 'ajv';
import * as r from 'rethinkdb';
import { connect } from '../db/connect';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import * as templateSchema from '../../json-schema/template.schema.json';
const ajv = Ajv();
const templateValidator = ajv.compile(templateSchema);

async function upload(files: string[]) {
  const conn = await connect();
  for (const file of files) {
    const info = path.parse(file);
    if (info.ext !== '.json') {
      console.error('file', file, 'is not a JSON file.');
      continue;
    }
    const template = JSON.parse(fs.readFileSync(file).toString());
    if (!templateValidator(template)) {
      // TODO: Decode and transform into error objects.
      console.error('Schema validation failure:', file, templateValidator.errors);
      continue;
    } else {
      template.id = info.name;
      const result = await r.table('templates').get(info.name).replace(template).run(conn);
      console.log(result);
      console.info(`Uploaded template '${info.name}'.`);
    }
  }

  conn.close();
}

upload(process.argv.slice(2));
