import { server } from '../Server';
import { Errors, Role } from 'klendathu-json-types';
import { AccountRecord, MembershipRecord } from '../db/types';
import { getProjectAndRole } from '../db/userRole';
import { zeroOrOne } from '../db/helpers';
import { logger } from '../logger';
import { handleAsyncErrors } from './errors';
import * as r from 'rethinkdb';

// set project role.
server.api.post('/projects/:account/:project/members/:otherUser',
    handleAsyncErrors(async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;
  const { account, project, otherUser }:
      { account: string, project: string, otherUser: string } = req.params;
  const { projectRecord, role } = await getProjectAndRole(account, project, user);
  const { role: newRole } = req.body;
  const details = { user: user.uname, account, project, otherUser, role: newRole };

  if (!projectRecord) {
    logger.error(`set project role: project ${project} not found.`, details);
    res.status(404).json({ error: Errors.NOT_FOUND });
  } else if (role < Role.MANAGER || role < newRole) {
    logger.error('set project role: user has insufficient privileges.', details);
    res.status(403).json({ error: Errors.FORBIDDEN });
  } else if (!newRole || newRole < Role.VIEWER || newRole > Role.ADMINISTRATOR) {
    logger.error('set project role: invalid role.', details);
    res.status(400).json({ error: Errors.INVALID_ROLE, details });
  } else {
    const existingUser = await r.table('accounts').get(otherUser).run(server.conn);
    if (!existingUser)  {
      logger.error('set project role: user not found.', details);
      res.status(404).json({ error: Errors.NOT_FOUND });
      return;
    }

    const projectId = `${account}/${project}`;
    const memberFilter = {
      project: projectId,
      user: otherUser,
    };
    const existingMembership = await r.table('memberships')
        .filter(memberFilter)
        .run(server.conn)
        .then(zeroOrOne<MembershipRecord>(details));
    if (existingMembership && existingMembership.role > role) {
      logger.error('set project role: attempt to modify higher-privileged user.', details);
      res.status(403).json({ error: Errors.FORBIDDEN });
      return;
    }

    const now = new Date();
    if (existingMembership) {
      if (existingMembership.role !== newRole) {
        await r.table('memberships')
            .get(existingMembership.id)
            .update({ role: newRole, updated: now })
            .run(server.conn);
      }
    } else {
      const membership: MembershipRecord = {
        user: otherUser,
        project: projectId,
        role: newRole,
        created: now,
        updated: now,
      };
      await r.table('memberships').insert(membership).run(server.conn);
    }
    res.end();
  }
}));

// delete project role.
server.api.delete('/projects/:account/:project/members/:otherUser',
    handleAsyncErrors(async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;
  const { account, project, otherUser }:
      { account: string, project: string, otherUser: string } = req.params;
  const { projectRecord, role } = await getProjectAndRole(account, project, user);
  const details = { user: user.uname, account, project, otherUser };

  if (!projectRecord) {
    logger.error(`delete project role: project ${project} not found.`, details);
    res.status(404).json({ error: Errors.NOT_FOUND });
  } else if (role < Role.MANAGER) {
    logger.error('delete project role: user has insufficient privileges.', details);
    res.status(403).json({ error: Errors.FORBIDDEN });
  } else {
    const existingUser = await r.table('accounts').get(otherUser).run(server.conn);
    if (!existingUser)  {
      logger.error('delete project role: user not found.', details);
      res.status(404).json({ error: Errors.NOT_FOUND });
      return;
    }

    const projectId = `${account}/${project}`;
    const memberFilter = {
      project: projectId,
      user: otherUser,
    };
    const existingMembership = await r.table('memberships')
        .filter(memberFilter)
        .run(server.conn)
        .then(zeroOrOne<MembershipRecord>(details));
    if (existingMembership && existingMembership.role > role) {
      logger.error('delete project role: attempt to modify higher-privileged user.', details);
      res.status(403).json({ error: Errors.FORBIDDEN });
      return;
    }

    if (existingMembership) {
      await r.table('memberships')
          .get(existingMembership.id)
          .delete()
          .run(server.conn);
    }
    res.end();
  }
}));
