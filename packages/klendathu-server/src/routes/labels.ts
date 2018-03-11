import { server } from '../Server';
import { Label, Role } from 'klendathu-json-types';
import { AccountRecord } from '../db/types';
import { getProjectAndRole } from '../db/userRole';
import { logger } from '../logger';
import * as r from 'rethinkdb';

// Create a new label.
server.api.post('/labels/:account/:project', async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;
  const { account, project }: { account: string, project: string } = req.params;
  const { projectRecord, role } = await getProjectAndRole(account, project, user);
  const input = req.body as Label;
  const details = { user: user.uname, account, project };

  if (!projectRecord || (!projectRecord.isPublic && role < Role.VIEWER)) {
    if (project) {
      logger.error(`create label: project ${project} not visible.`, details);
    } else {
      logger.error(`create label: project ${project} not found.`, details);
    }
    res.status(404).json({ error: 'not-found' });
  } else if (role < Role.DEVELOPER) {
    logger.error(`create label: user has insufficient privileges.`, details);
    res.status(403).json({ error: 'forbidden' });
  } else if (!input.name) {
    logger.error(`create label: missing field 'name'.`, details);
    res.status(400).json({ error: 'missing-name' });
  } else if (!input.color) {
    logger.error(`create label: missing field 'color'.`, details);
    res.status(400).json({ error: 'missing-name' });
  } else {
    // Increment the label id counter.
    const projectId = `${account}/${project}`;
    const resp: any = await r.table('projects').get(projectId).update({
      labelIdCounter: r.row('labelIdCounter').default(0).add(1),
    }, {
      returnChanges: true,
    }).run(server.conn);

    const now = new Date();
    const labelId = `${account}/${project}/${resp.changes[0].new_val.labelIdCounter}`;
    const labelRecord: Label = {
      id: labelId,
      project: projectId,
      name: input.name,
      color: input.color,
      creator: user.id,
      created: now,
      updated: now,
    };

    const result = await r.table('labels').insert(labelRecord, { returnChanges: true })
        .run(server.conn);
    const nl: Label = (result as any).changes[0].new_val;
    logger.info('Created label', nl.name, nl.id);
    res.json(nl);
  }
});

server.api.patch('/labels/:account/:project/:label', async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;
  const { account, project, label }: { account: string, project: string, label: string } =
      req.params;
  const { projectRecord, role } = await getProjectAndRole(account, project, user);
  const input = req.body as Label;
  const details = { user: user.uname, account, project };

  if (!projectRecord || (!projectRecord.isPublic && role < Role.VIEWER)) {
    if (project) {
      logger.error(`create label: project ${project} not visible.`, details);
    } else {
      logger.error(`create label: project ${project} not found.`, details);
    }
    res.status(404).json({ error: 'not-found' });
  } else if (role < Role.DEVELOPER) {
    logger.error(`create label: user has insufficient privileges.`, details);
    res.status(403).json({ error: 'forbidden' });
  } else {
    const labelId = `${account}/${project}/${label}`;
    const record: Partial<Label> = {
      updated: new Date(),
    };
    if (input.name) {
      record.name = input.name;
    }
    if (input.color) {
      record.color = input.color;
    }

    const resp = await r.table('labels').get(labelId)
      .update(record, { returnChanges: true })
      .run(server.conn);
    if (resp.replaced === 1) {
      res.json((resp as any).changes[0].new_val);
    } else {
      logger.error('Error updating non-existent label', details);
      res.status(404).json({ error: 'not-found' });
    }
  }
});

server.api.delete('/labels/:account/:project/:label', async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;
  const { account, project, label }: { account: string, project: string, label: string } =
      req.params;
  const { projectRecord, role } = await getProjectAndRole(account, project, user);
  const details = { user: user.uname, account, project };

  if (!projectRecord || (!projectRecord.isPublic && role < Role.VIEWER)) {
    if (project) {
      logger.error(`create label: project ${project} not visible.`, details);
    } else {
      logger.error(`create label: project ${project} not found.`, details);
    }
    res.status(404).json({ error: 'not-found' });
  } else if (role < Role.DEVELOPER) {
    logger.error(`create label: user has insufficient privileges.`, details);
    res.status(403).json({ error: 'forbidden' });
  } else {
    const projectId = `${account}/${project}`;
    const labelId = `${account}/${project}/${label}`;
    console.log('delete', labelId);

    // Delete all instances of that label from issues
    await r.table('issues').filter({ project: projectId }).update({
      labels: (r.row('labels') as any).filter((id: string) => id !== labelId),
    }).run(server.conn);

    // Delete all instances of that label from project prefs
    await r.table('projectPrefs').filter({ project: projectId }).update({
      labels: (r.row('labels') as any).filter((id: string) => id !== labelId),
    }).run(server.conn);

    // Delete the label record
    const resp = await r.table('labels')
        .get(labelId)
        .delete()
        .run(server.conn);
    if (resp.deleted !== 1) {
      res.status(404).json({ error: 'not-found' });
    } else {
      res.json(labelId);
    }
  }
});
