import { server } from '../Server';
import {  Errors, Milestone, Role } from 'klendathu-json-types';
import { AccountRecord, MilestoneRecord } from '../db/types';
import { getProjectAndRole } from '../db/userRole';
import { logger } from '../logger';
import * as Ajv from 'ajv';
import * as r from 'rethinkdb';

import * as milestoneInputSchema from '../../json-schema/milestone-input.schema.json';

const ajv = Ajv();
const milestoneInputValidator = ajv.compile(milestoneInputSchema);

// Create a new milestone.
server.api.post('/projects/:account/:project/milestones', async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;
  const { account, project }: { account: string, project: string } = req.params;
  const { projectRecord, role } = await getProjectAndRole(account, project, user);
  const input = req.body as Milestone;
  const details = { user: user.uname, account, project };

  if (!projectRecord || (!projectRecord.isPublic && role < Role.VIEWER)) {
    if (project) {
      logger.error(`create milestone: project ${project} not visible.`, details);
    } else {
      logger.error(`create milestone: project ${project} not found.`, details);
    }
    res.status(404).json({ error: 'not-found' });
  } else if (role < Role.MANAGER) {
    logger.error(`create milestone: user has insufficient privileges.`, details);
    res.status(403).json({ error: 'forbidden' });
  } else if (!milestoneInputValidator(input)) {
    // TODO: Decode and transform into error objects.
    res.status(400).json({ error: Errors.SCHEMA, details: milestoneInputValidator.errors });
    logger.error('Schema validation failure:', req.body, milestoneInputValidator.errors);
  } else {
    // Increment the milestone id counter.
    const projectId = `${account}/${project}`;
    const milestoneId = await r.uuid().run(server.conn);
    const milestoneRecord: MilestoneRecord = {
      id: milestoneId,
      project: projectId,
      name: input.name,
      description: input.description,
      status: input.status,
      startDate: input.startDate,
      endDate: input.endDate,
    };

    const result = await r.table('milestones').insert(milestoneRecord, { returnChanges: true })
        .run(server.conn);
    const nl: Milestone = (result as any).changes[0].new_val;
    logger.info('Created milestone', nl.name, nl.id);
    res.json(nl);
  }
});

server.api.patch('/milestones/:milestone', async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }

  const user = req.user as AccountRecord;
  const { milestone }: { milestone: string } = req.params;

  const record = await r.table('milestones').get<Milestone>(milestone).run(server.conn);
  if (!record) {
    logger.error(`Milestone not found.`, { user: user.uname, milestone });
    res.status(404).json({ error: Errors.NOT_FOUND });
    return;
  }

  const [account, project] = record.project.split('/');
  const { projectRecord, role } = await getProjectAndRole(account, project, user);
  const input = req.body as Milestone;
  const details = { user: user.uname, account, project };

  if (!projectRecord || (!projectRecord.isPublic && role < Role.VIEWER)) {
    if (project) {
      logger.error(`create milestone: project ${project} not visible.`, details);
    } else {
      logger.error(`create milestone: project ${project} not found.`, details);
    }
    res.status(404).json({ error: Errors.NOT_FOUND });
  } else if (role < Role.MANAGER) {
    logger.error(`edit milestone: user has insufficient privileges.`, details);
    res.status(403).json({ error: Errors.FORBIDDEN });
  } else if (!milestoneInputValidator(input)) {
    // TODO: Decode and transform into error objects.
    res.status(400).json({ error: Errors.SCHEMA, details: milestoneInputValidator.errors });
    logger.error('Schema validation failure:', req.body, milestoneInputValidator.errors);
  } else {
    if (input.name) {
      record.name = input.name;
    }
    if (input.status) {
      record.status = input.status;
    }
    if (input.description) {
      record.description = input.description;
    }
    if (input.startDate) {
      record.startDate = input.startDate;
    }
    if (input.endDate) {
      record.endDate = input.endDate;
    }

    const resp = await r.table('milestones').get(milestone)
      .update(record, { returnChanges: true })
      .run(server.conn);
    if (resp.replaced === 1) {
      res.json((resp as any).changes[0].new_val);
    } else {
      logger.error('Error updating non-existent milestone', details);
      res.status(404).json({ error: 'not-found' });
    }
  }
});

server.api.delete('/milestones/:milestone', async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;
  const { milestone }: { milestone: string } = req.params;

  const record = await r.table('milestones').get<Milestone>(milestone).run(server.conn);
  if (!record) {
    logger.error(`Milestone not found.`, { user: user.uname, milestone });
    res.status(404).json({ error: Errors.NOT_FOUND });
    return;
  }

  const [account, project] = record.project.split('/');
  const { projectRecord, role } = await getProjectAndRole(account, project, user);
  const details = { user: user.uname, account, project };

  if (!projectRecord || (!projectRecord.isPublic && role < Role.VIEWER)) {
    if (project) {
      logger.error(`create milestone: project ${project} not visible.`, details);
    } else {
      logger.error(`create milestone: project ${project} not found.`, details);
    }
    res.status(404).json({ error: 'not-found' });
  } else if (role < Role.MANAGER) {
    logger.error(`create milestone: user has insufficient privileges.`, details);
    res.status(403).json({ error: 'forbidden' });
  } else {
    // Delete all instances of that milestone from issues
    await r.table('issues').filter({ milestone }).update({
      milestone: null,
    }).run(server.conn);

    // Delete the milestone record
    const resp = await r.table('milestones')
        .get(milestone)
        .delete()
        .run(server.conn);
    if (resp.deleted !== 1) {
      res.status(404).json({ error: 'not-found' });
    } else {
      res.json(milestone);
    }
  }
});
