import { server } from '../Server';
import { Role } from 'klendathu-json-types';
import { AccountRecord, ProjectRecord } from '../db/types';
import { getProjectAndRole } from '../db/projectRole';
import { logger } from '../logger';
import * as Ajv from 'ajv';
import * as r from 'rethinkdb';

import * as projectCreateSchema from '../../json-schema/project-create.schema.json';

const ajv = Ajv();
const projectCreateValidator = ajv.compile(projectCreateSchema);

// Create a new project.
server.api.post('/projects/:owner/:project', async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;

  const { owner, project }: { owner: string, project: string } = req.params;

  // Lookup the owner name
  const ownerRecord = await r.table('accounts').get<AccountRecord>(owner).run(server.conn);
  if (!ownerRecord) {
    res.status(500).json({ error: 'missing-name' });
    logger.error('Attempt to create project under non-existent name:', { user: user.uname, owner });
    return;
  }

  if (ownerRecord.type === 'user') {
    if (ownerRecord.id !== user.id) {
      res.status(403).json({ error: 'forbidden' });
      logger.error('You can only create projects for yourself.', { user: user.uname, owner });
      return;
    }
  } else {
    // TODO: Check organization role.
    res.status(500).json({ error: 'not-implemented' });
    logger.error(
        'Creating projects for organizations not implemented yet:', { user: user.uname, owner });
    return;
  }

  if (!project || project.length < 1) {
    res.status(400).json({ error: 'name-required' });
  } else if (!project.match(/^[a-z][\w\-\._]*$/)) {
    res.status(400).json({ error: 'invalid-name' });
  } else if (!projectCreateValidator(req.body)) {
    // TODO: Decode and transform into error objects.
    res.status(400).json({ error: 'schema-validation', details: projectCreateValidator.errors });
    logger.error('Schema validation failure:', req.body, projectCreateValidator.errors);
  } else {
    const projectId = `${owner}/${project}`;
    const existingProject =
        await r.table('projects').get<ProjectRecord>(projectId).run(server.conn);
    if (existingProject) {
      res.status(400).json({ error: 'name-exists', details: project });
      return;
    }

    const { title, description = '', public: isPublic }: {
      title: string;
      description: string;
      public: boolean;
    } = req.body;

    const now = new Date();
    const pr: ProjectRecord = {
      id: projectId,
      title,
      description,
      owner,
      created: now,
      updated: now,
      template: null,
      isPublic,
    };

    await r.table('projects').insert(pr).run(server.conn);
    logger.info('Created project:', { user: user.uname, owner, project });
    res.end();
  }
});

// Create a project
server.api.delete('/projects/:owner/:project', async (req, res) => {
  const user = req.user as AccountRecord;
  const { owner, project }: { owner: string, project: string } = req.params;
  const { projectRecord, role } = await getProjectAndRole(owner, project, user);
  if (!projectRecord) {
    logger.error('Project not found:', { user: user.uname, owner, project });
    res.status(404).json({ error: 'not-found' });
    return;
  }

  if (role < Role.ADMINISTRATOR) {
    logger.error('No permission to delete project:', { user: user.uname, owner, project });
    res.status(403).json({ error: 'forbidden' });
    return;
  }

  logger.info('Deleting project:', { user: user.uname, project, owner });
  await r.table('projects').get(projectRecord.id).delete().run(server.conn);
  res.end();
});
