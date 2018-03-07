import { server } from '../Server';
import { IssueInput, Relation, Role } from 'klendathu-json-types';
import {
  AccountRecord,
  IssueChangeRecord,
  IssueLinkRecord,
  IssueRecord,
} from '../db/types';
import { getProjectAndRole } from '../db/userRole';
import { logger } from '../logger';
import * as Ajv from 'ajv';
import * as r from 'rethinkdb';

import * as issueInputSchema from '../../json-schema/issue-input.schema.json';

const ajv = Ajv();
const issueInputValidator = ajv.compile(issueInputSchema);

function inverseRelation(relation: Relation): Relation {
  switch (relation) {
    case Relation.BLOCKED_BY: return Relation.BLOCKS;
    case Relation.BLOCKS: return Relation.BLOCKED_BY;
    case Relation.PART_OF: return Relation.HAS_PART;
    case Relation.HAS_PART: return Relation.PART_OF;
    default:
      return relation;
  }
}

// Create a new issue.
server.api.post('/issues/:account/:project', async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;
  const { account, project }: { account: string, project: string } = req.params;
  const { projectRecord, role } = await getProjectAndRole(account, project, user);
  const details = { user: user.uname, account, project };

  if (!projectRecord || (!projectRecord.isPublic && role < Role.VIEWER)) {
    if (project) {
      logger.error(`create issue: project ${project} not visible.`, details);
    } else {
      logger.error(`create issue: project ${project} not found.`, details);
    }
    res.status(404).json({ error: 'not-found' });
  } else if (role < Role.REPORTER) {
    logger.error(`create issue: user has insufficient privileges.`, details);
    res.status(403).json({ error: 'forbidden' });
  } else if (!issueInputValidator(req.body)) {
    // TODO: Decode and transform into error objects.
    res.status(400).json({ error: 'schema-validation', details: issueInputValidator.errors });
    logger.error('Schema validation failure:', req.body, issueInputValidator.errors);
  } else {
    // Increment the issue id counter.
    const projectId = `${account}/${project}`;
    const resp: any = await r.table('projects').get(projectId).update({
      issueIdCounter: r.row('issueIdCounter').default(0).add(1),
    }, {
      returnChanges: true,
    }).run(server.conn);

    const now = new Date();
    const issueId = `${account}/${project}/${resp.changes[0].new_val.issueIdCounter}`;
    const input: IssueInput = req.body;

    const record: IssueRecord = {
      id: issueId,
      project: projectId,
      type: input.type,
      state: input.state,
      summary: input.summary,
      description: input.description,
      reporter: user.id,
      owner: input.owner || null,
      created: now,
      updated: now,
      cc: (input.cc || []),
      labels: input.labels || [],
      custom: input.custom,
      isPublic: !!input.isPublic,
    };

    // attachments: input.attachments || [],
    // comments: (args.input.comments || []).map((comment, index) => ({
    //   id: index,
    //   body: comment.body,
    //   author: context.user.id,
    //   created: now,
    //   updated: now,
    // })),

    // TODO: Insert comments
    // TODO: Insert attachments

    const result = await r.table('issues')
        .insert(record, { returnChanges: true })
        .run(server.conn);
    if (result.inserted === 1) {
      const row: IssueRecord = (result as any).changes[0].new_val;
      if (input.linked && input.linked.length > 0) {
        const linksToInsert: IssueLinkRecord[] = [];
        const changesToInsert: IssueChangeRecord[] = [];
        for (const link of input.linked) {
          linksToInsert.push({
            from: row.id,
            to: link.to,
            relation: link.relation,
          });
          changesToInsert.push({
            issue: row.id,
            by: user.id,
            at: now,
            linked: [{ to: link.to, after: link.relation }],
          });
          const inv = inverseRelation(link.relation);
          linksToInsert.push({
            from: link.to,
            to: row.id,
            relation: inv,
          });
          changesToInsert.push({
            issue: link.to,
            by: user.id,
            at: now,
            linked: [{ to: row.id, after: inv }],
          });
        }
        await r.table('issueLinks').insert(linksToInsert).run(server.conn);
        await r.table('issueChanges').insert(changesToInsert).run(server.conn);
      }
      return row;
    } else if (result.errors > 0) {
      logger.error('Error creating issue', result.first_error);
      res.status(500).json({ error: 'internal', details: result.first_error });
    } else {
      logger.error('Error: issue not created.');
      res.status(500).json({ error: 'internal' });
    }
  }
});
