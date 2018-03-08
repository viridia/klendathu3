import { server } from '../Server';
import { Errors, Role } from 'klendathu-json-types';
import { AccountRecord, LabelRecord, ProjectPrefsRecord } from '../db/types';
import { getProjectAndRole } from '../db/userRole';
import { logger } from '../logger';
import * as r from 'rethinkdb';

// Add a label to the set of visible labels for a user.
server.api.put('/project-prefs/:account/:project/label/:label', async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;
  const { account, project, label }:
      { account: string, project: string, label: string } = req.params;
  const { projectRecord, role } = await getProjectAndRole(account, project, user);
  const details = { user: user.uname, account, project, label };
  const labelId = `${account}/${project}/${label}`;

  if (!projectRecord || (!projectRecord.isPublic && role < Role.VIEWER)) {
    if (project) {
      logger.error(`project prefs add label: project ${project} not visible.`, details);
    } else {
      logger.error(`project prefs add label: project ${project} not found.`, details);
    }
    res.status(404).json({ error: Errors.NOT_FOUND });
  } else if (role < Role.VIEWER) {
    logger.error(`project prefs add label: user has insufficient privileges.`, details);
    res.status(403).json({ error: Errors.FORBIDDEN });
  } else if (!label) {
    logger.error(`project prefs add label: missing field 'label'.`, details);
    res.status(400).json({ error: Errors.MISSING_LABEL });
  } else {
    const labelRecord = await r.table('labels').get<LabelRecord>(labelId).run(server.conn);
    if (!labelRecord) {
      logger.error(`project prefs add label: label ${label} not found.`, details);
      res.status(404).json({ error: Errors.NOT_FOUND });
      return;
    }

    const prefsId = `${account}/${project}/${user.id}`;
    const prefsRecord = await r.table('projectPrefs').get(prefsId).run(server.conn);
    if (!prefsRecord) {
      const newPrefsRecord: ProjectPrefsRecord = {
        id: prefsId,
        columns: null,
        labels: [labelId],
        filters: [],
      };

      const insResult = await r.table('projectPrefs').insert(newPrefsRecord).run(server.conn);
      if (insResult.errors > 0) {
        logger.error('Error writing project prefs', insResult.first_error);
        res.status(500).json({ error: 'internal', details: insResult.first_error });
      } else {
        res.status(200).end();
      }
    } else {
      const updResult = await r.table('projectPrefs').update({
        labels: (r.row('labels') as any).setUnion([labelId]),
      }).run(server.conn);
      if (updResult.errors > 0) {
        logger.error('Error writing project prefs', updResult.first_error);
        res.status(500).json({ error: 'internal', details: updResult.first_error });
      } else {
        res.status(200).end();
      }
    }
  }
});

server.api.delete('/project-prefs/:account/:project/label/:label', async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;
  const { account, project, label }:
      { account: string, project: string, label: string } = req.params;
  const { projectRecord, role } = await getProjectAndRole(account, project, user);
  const details = { user: user.uname, account, project };
  const labelId = `${account}/${project}/${label}`;

  if (!projectRecord || (!projectRecord.isPublic && role < Role.VIEWER)) {
    if (project) {
      logger.error(`project prefs remove label: project ${project} not visible.`, details);
    } else {
      logger.error(`project prefs remove label: project ${project} not found.`, details);
    }
    res.status(404).json({ error: Errors.NOT_FOUND });
  } else if (role < Role.VIEWER) {
    logger.error(`project prefs remove label: user has insufficient privileges.`, details);
    res.status(403).json({ error: Errors.FORBIDDEN });
  } else if (!label) {
    logger.error(`project prefs remove label: missing field 'label'.`, details);
    res.status(400).json({ error: Errors.MISSING_LABEL });
  } else {
    const prefsId = `${account}/${project}/${user.id}`;
    const updResult = await r.table('projectPrefs').get(prefsId).update({
      labels: (r.row('labels') as any).setDifference([labelId]),
    }).run(server.conn);

    if (updResult.errors > 0) {
      logger.error('Error writing project prefs', updResult.first_error);
      res.status(500).json({ error: 'internal', details: updResult.first_error });
    } else {
      res.status(200).end();
    }
  }
});
