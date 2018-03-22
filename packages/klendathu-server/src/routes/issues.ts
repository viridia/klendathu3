import { server } from '../Server';
import {
  CustomFieldChange,
  CustomValues,
  Errors,
  IssueInput,
  IssueEdit,
  Role,
  inverseRelations,
} from 'klendathu-json-types';
import {
  AccountRecord,
  CommentRecord,
  IssueChangeRecord,
  IssueLinkRecord,
  IssueRecord,
} from '../db/types';
import { getProjectAndRole } from '../db/userRole';
import { logger } from '../logger';
import * as Ajv from 'ajv';
import * as r from 'rethinkdb';

import * as issueInputSchema from '../../json-schema/issue-input.schema.json';
import * as issueEditSchema from '../../json-schema/issue-edit.schema.json';

const ajv = Ajv();
const issueInputValidator = ajv.compile(issueInputSchema);
const issueEditValidator = ajv.compile(issueEditSchema);

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
    res.status(404).json({ error: Errors.NOT_FOUND });
  } else if (role < Role.REPORTER) {
    logger.error(`create issue: user has insufficient privileges.`, details);
    res.status(403).json({ error: Errors.FORBIDDEN });
  } else if (!issueInputValidator(req.body)) {
    // TODO: Decode and transform into error objects.
    res.status(400).json({ error: Errors.SCHEMA, details: issueInputValidator.errors });
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
      reporterSort: user.uname || '',
      owner: input.owner || null,
      ownerSort: input.ownerSort || '',
      created: now,
      updated: now,
      cc: (input.cc || []),
      labels: input.labels || [],
      custom: input.custom,
      isPublic: !!input.isPublic,
      position: input.position || null,
      attachments: input.attachments || [],
    };

    const commentsToInsert: CommentRecord[] = (input.comments || []).map(comment => ({
      issue: issueId,
      author: user.id,
      body: comment,
      created: now,
      updated: now,
    }));

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
            project: projectId,
            by: user.id,
            at: now,
            linked: [{ to: link.to, after: link.relation }],
          });
          const inv = inverseRelations[link.relation];
          changesToInsert.push({
            issue: link.to,
            project: projectId,
            by: user.id,
            at: now,
            linked: [{ to: row.id, after: inv }],
          });
        }
        await r.table('issueLinks').insert(linksToInsert).run(server.conn);
        await r.table('issueChanges').insert(changesToInsert).run(server.conn);
        await r.table('comments').insert(commentsToInsert).run(server.conn);
      }
      res.json(record);
    } else if (result.errors > 0) {
      logger.error('Error creating issue', result.first_error);
      res.status(500).json({ error: Errors.INTERNAL, details: result.first_error });
    } else {
      logger.error('Error: issue not created.');
      res.status(500).json({ error: Errors.INTERNAL });
    }
  }
});

function mapFromObject(obj: CustomValues): Map<string, string | number | boolean> {
  const map = new Map();
  Object.keys(obj).forEach(key => {
    map.set(key, obj[key]);
  });
  return map;
}

// Create a new issue.
server.api.patch('/issues/:account/:project/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;
  const { account, project, id }: { account: string, project: string, id: string } = req.params;
  const { projectRecord, role } = await getProjectAndRole(account, project, user);
  const details = { user: user.uname, account, project };

  if (!projectRecord || (!projectRecord.isPublic && role < Role.VIEWER)) {
    if (project) {
      logger.error(`edit issue: project ${project} not visible.`, details);
    } else {
      logger.error(`edit issue: project ${project} not found.`, details);
    }
    res.status(404).json({ error: Errors.NOT_FOUND });
  } else if (role < Role.UPDATER) {
    logger.error(`edit issue: user has insufficient privileges.`, details);
    res.status(403).json({ error: Errors.FORBIDDEN });
  } else if (!issueEditValidator(req.body)) {
    // TODO: Decode and transform into error objects.
    res.status(400).json({ error: Errors.SCHEMA, details: issueInputValidator.errors });
    logger.error('Schema validation failure:', req.body, issueInputValidator.errors);
  } else {
    const projectId = `${account}/${project}`;
    const issueId = `${account}/${project}/${id}`;
    const now = new Date();
    const input: IssueEdit = req.body;

    //  Ensure that all of the issues we are linking to actually exist.
    if (input.linked) {
      const linkedIssueIds = new Set(input.linked.map(link => link.to));
      const linkedIssues =
          await r.table('issues').getAll(...linkedIssueIds).run(server.conn);
      for (const issue of await linkedIssues.toArray()) {
        if (!issue) {
          res.status(404).json({ error: Errors.INVALID_LINK });
          return;
        }
      }
    }

    // TODO: ensure reporter is valid
    // TODO: ensure ccs are valid
    // TODO: ensure labels are valid
    // TODO: ensure attachments are valid

    const existing: IssueRecord = await r.table('issues').get(issueId).run(server.conn) as any;
    if (existing === null) {
      res.status(404).json({ error: Errors.NOT_FOUND });
      return;
    }

    const record: Partial<IssueRecord> = {
      id: issueId,
      updated: now,
    };

    const change: IssueChangeRecord = {
      project: projectId,
      issue: issueId,
      by: user.id,
      at: null, // 'at' is also used as a marker to indicate that this record needs to be updated.
    };

    // Change type
    if ('type' in input && input.type !== existing.type) {
      record.type = input.type;
      change.type = { before: existing.type, after: input.type };
      change.at = record.updated;
    }

    // Change state
    if ('state' in input && input.state !== existing.state) {
      record.state = input.state;
      change.state = { before: existing.state, after: input.state };
      change.at = record.updated;
    }

    if ('summary' in input && input.summary !== existing.summary) {
      record.summary = input.summary;
      change.summary = { before: existing.summary, after: input.summary };
      change.at = record.updated;
    }

    if ('description' in input && input.description !== existing.description) {
      record.description = input.description;
      change.description = { before: existing.description, after: input.description };
      change.at = record.updated;
    }

    if ('owner' in input && input.owner !== existing.owner) {
      record.owner = input.owner;
      record.ownerSort = input.ownerSort || null;
      change.owner = { before: existing.owner, after: input.owner };
      change.at = record.updated;
    }

    // Compute which cc entries have been added or deleted.
    if (input.addCC || input.removeCC) {
      const added: string[] = [];
      const removed: string[] = [];

      const cc = [...existing.cc];
      if (input.addCC) {
        for (const l of input.addCC) {
          if (cc.indexOf(l) < 0) {
            added.push(l);
            cc.push(l);
          }
        }
      }

      if (input.removeCC) {
        for (const l of input.removeCC) {
          const index = cc.indexOf(l);
          if (index >= 0) {
            removed.push(l);
            cc.splice(index, 1);
          }
        }
      }

      if (added || removed) {
        record.cc = cc;
        change.cc = { added, removed };
        change.at = record.updated;
      }
    } else if ('cc' in input) {
      const ccPrev = new Set(existing.cc); // Removed items
      const ccNext = new Set(input.cc);    // Newly-added items
      input.cc.forEach(cc => ccPrev.delete(cc));
      existing.cc.forEach(cc => ccNext.delete(cc));
      record.cc = input.cc;
      if (ccNext.size > 0 || ccPrev.size > 0) {
        change.cc = { added: Array.from(ccNext), removed: Array.from(ccPrev) };
        change.at = record.updated;
      }
    }

    // Compute which labels have been added or deleted.
    if (input.addLabels || input.removeLabels) {
      const added: string[] = [];
      const removed: string[] = [];

      const labels = [...existing.labels];
      if (input.addLabels) {
        for (const l of input.addLabels) {
          if (labels.indexOf(l) < 0) {
            added.push(l);
            labels.push(l);
          }
        }
      }

      if (input.removeLabels) {
        for (const l of input.removeLabels) {
          const index = labels.indexOf(l);
          if (index >= 0) {
            removed.push(l);
            labels.splice(index, 1);
          }
        }
      }

      if (added || removed) {
        record.labels = labels;
        change.labels = { added, removed };
        change.at = record.updated;
      }
    } else if ('labels' in input) {
      const labelsPrev = new Set(existing.labels); // Removed items
      const labelsNext = new Set(input.labels);    // Newly-added items
      input.labels.forEach(labels => labelsPrev.delete(labels));
      existing.labels.forEach(labels => labelsNext.delete(labels));
      record.labels = input.labels;
      if (labelsNext.size > 0 || labelsPrev.size > 0) {
        change.labels = { added: Array.from(labelsNext), removed: Array.from(labelsPrev) };
        change.at = record.updated;
      }
    }

    if ('custom' in input) {
      record.custom = input.custom;
      const customPrev = mapFromObject(existing.custom);
      const customNext = mapFromObject(record.custom);
      const customChange: CustomFieldChange[] = [];
      customNext.forEach((value, name) => {
        if (customPrev.has(name)) {
          const before = customPrev.get(name);
          if (value !== before) {
            // A changed value
            customChange.push({ name, before, after: value });
          }
        } else {
          // A newly-added value
          customChange.push({ name, after: value });
        }
      });
      customPrev.forEach((value, name) => {
        if (!customNext.has(name)) {
          // A deleted value
          customChange.push({ name, before: value });
        }
      });
      if (customChange.length > 0) {
        change.custom = customChange;
        change.at = record.updated;
      }
    }

    if ('attachments' in input) {
      const existingAttachments = existing.attachments || [];
      record.attachments = input.attachments;
      const attachmentsPrev = new Set(existingAttachments);
      const attachmentsNext = new Set(input.attachments);
      input.attachments.forEach(attachments => attachmentsPrev.delete(attachments));
      existingAttachments.forEach(attachments => attachmentsNext.delete(attachments));
      if (attachmentsNext.size > 0 || attachmentsPrev.size > 0) {
        change.attachments = {
          added: Array.from(attachmentsNext),
          removed: Array.from(attachmentsPrev),
        };
        change.at = record.updated;
      }
    }

    // Patch comments list.
    // Note that we don't include comments in the change log since the comments themselves can
    // serve that purpose.
    if ('comments' in input) {
      for (const c of input.comments) {
        // Insert a new comment from this author.
        const comment: CommentRecord = {
          issue: issueId,
          author: user.id,
          body: c,
          created: now,
          updated: now,
        };
        r.table('comment').insert(comment).run(server.conn);
      }
    }

    if (input.linked) {
      // Find all the link records (in both directions)
      const [fwdLinks, rvsLinks]: [IssueLinkRecord[], IssueLinkRecord[]] = await Promise.all([
        r.table('issueLinks').filter({ project: projectId, from: issueId })
            .run(server.conn)
            .then(cursor => cursor.toArray()),
        r.table('issueLinks').filter({ project: projectId, to: issueId })
            .run(server.conn)
            .then(cursor => cursor.toArray()),
      ]);
      const fwdMap = new Map<string, IssueLinkRecord>(
        fwdLinks.map(ln => [ln.to, ln] as [string, IssueLinkRecord]));
      const rvsMap = new Map<string, IssueLinkRecord>(
        rvsLinks.map(ln => [ln.to, ln] as [string, IssueLinkRecord]));
      const toInsert: IssueLinkRecord[] = [];
      const toRemove: IssueLinkRecord[] = [];
      const toUpdate: IssueLinkRecord[] = [];
      const changeRecords: IssueChangeRecord[] = [];
      change.linked = [];
      for (const lnk of input.linked) {
        const inv = inverseRelations[lnk.relation];
        const fwd = fwdMap.get(lnk.to);
        const rvs = rvsMap.get(lnk.to);
        // If there's no existing relationship
        if (!fwd && !rvs) {
          toInsert.push({
            from: issueId,
            to: lnk.to,
            relation: lnk.relation,
          });
          // Add a change entry for existing link
          change.linked.push({
            to: lnk.to,
            after: lnk.relation,
          });
          // Create a change record for the 'to' record
          changeRecords.push({
            project: projectId,
            by: user.id,
            issue: lnk.to,
            at: record.updated,
            linked: [{
              to: issueId,
              after: inv,
            }],
          });
        } else if (fwd) {
          // If the relationship changed
          if (fwd.relation !== lnk.relation) {
            // Add a change entry
            change.linked.push({
              to: lnk.to,
              before: fwd.relation,
              after: lnk.relation,
            });
            // Update the record
            fwd.relation = lnk.relation;
            toUpdate.push(fwd);
          }
        } else if (rvs) {
          if (rvs.relation !== inv) {
            // Add a change record to the issue referenced in the inverse link
            changeRecords.push({
              project: projectId,
              by: user.id,
              issue: fwd.to,
              at: record.updated,
              linked: [{
                to: issueId,
                before: rvs.relation,
                after: inv,
              }],
            });

            // Update the inverse link
            rvs.relation = inv;
            toUpdate.push(rvs);
          }
        }

        // There's an existing link we need to update
        // if (fwd) {
        //   // If the relationship changed
        //   if (fwd.relation !== lnk.relation) {
        //     // Add a change entry
        //     change.linked.push({
        //       to: lnk.to,
        //       before: fwd.relation,
        //       after: lnk.relation,
        //     });
        //     // Update the record
        //     fwd.relation = lnk.relation;
        //     toUpdate.push(fwd);
        //   }
        // } else {
        //   // There was no existing link
        //   toInsert.push({
        //     from: issueId,
        //     to: lnk.to,
        //     relation: lnk.relation,
        //   });
        //   // Add a change entry for existing link
        //   change.linked.push({
        //     to: lnk.to,
        //     after: lnk.relation,
        //   });
        // }
        //
        // // There's an existing inverse link
        // if (rvs) {
        //   if (rvs.relation !== inv) {
        //     // Add a change record to the issue referenced in the inverse link
        //     changeRecords.push({
        //       project: projectId,
        //       by: user.id,
        //       issue: fwd.to,
        //       at: record.updated,
        //       linked: [{
        //         to: issueId,
        //         before: rvs.relation,
        //         after: inv,
        //       }],
        //     });
        //
        //     // Update the inverse link
        //     rvs.relation = inv;
        //     toUpdate.push(rvs);
        //   }
        // } else {
        //   // There was no inverse link, so create a new one
        //   // toInsert.push({
        //   //   from: lnk.to,
        //   //   to: issueId,
        //   //   relation: inv,
        //   // });
        //   // Create a change record for the new link
        //   changeRecords.push({
        //     project: projectId,
        //     by: user.id,
        //     issue: lnk.to,
        //     at: record.updated,
        //     linked: [{
        //       to: issueId,
        //       after: inv,
        //     }],
        //   });
        // }
      }

      // Remove any entries from the maps that were maintained
      for (const lnk of input.linked) {
        fwdMap.delete(lnk.to);
        rvsMap.delete(lnk.to);
      }

      // Delete all forward links that weren't in the list
      for (const fwd of fwdMap.values()) {
        // Queue link for deletion
        toRemove.push(fwd);
        // Add a change entry no existing link
        change.linked.push({
          to: fwd.to,
          before: fwd.relation,
        });
      }

      // Delete all reverse links that weren't in the list
      for (const rvs of rvsMap.values()) {
        // Queue link for deletion
        toRemove.push(rvs);
        // Add a change entry no existing link
        changeRecords.push({
          project,
          by: user.id,
          issue: rvs.from,
          at: record.updated,
          linked: [{
            to: issueId,
            before: rvs.relation,
          }],
        });
      }

      if (change.linked.length > 0) {
        change.at = record.updated;
      }

      const promises: Array<Promise<any>> = [];
      if (toInsert) {
        promises.push(r.table('issueLinks').insert(toInsert).run(server.conn));
      }
      if (toRemove) {
        promises.push(r.table('issueLinks')
            .getAll(...toRemove.map(lnk => lnk.id))
            .delete().run(server.conn));
      }
      if (toUpdate) {
        for (const lnk of toUpdate) {
          promises.push(r.table('issueLinks')
              .get(lnk.id)
              .update(lnk).run(server.conn));
        }
      }
      if (changeRecords) {
        promises.push(r.table('issueChanges').insert(changeRecords).run(server.conn));

      }

      await Promise.all(promises);
    }

    if (change.at) {
      await r.table('issueChanges').insert(change).run(server.conn);
    }

    if (change.at || input.comments) {
      const result = await r.table('issues').update(record, { returnChanges: true })
          .run(server.conn);
      res.json((result as any).changes[0].new_val);
    } else {
      res.json(existing);
    }
  }
});

// Delete an new issue.
server.api.delete('/issues/:account/:project/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;
  const { account, project, id }: { account: string, project: string, id: string } = req.params;
  const { projectRecord, role } = await getProjectAndRole(account, project, user);
  const details = { user: user.uname, account, project };

  if (!projectRecord || (!projectRecord.isPublic && role < Role.VIEWER)) {
    if (project) {
      logger.error(`delete issue: project ${project} not visible.`, details);
    } else {
      logger.error(`delete issue: project ${project} not found.`, details);
    }
    res.status(404).json({ error: Errors.NOT_FOUND });
  } else if (role < Role.UPDATER) {
    logger.error(`delete issue: user has insufficient privileges.`, details);
    res.status(403).json({ error: Errors.FORBIDDEN });
  } else {
    const issueId = `${account}/${project}/${id}`;
    const existing = await r.table('issues').get<IssueRecord>(issueId).run(server.conn);
    if (existing === null) {
      logger.error(`delete issue: issue ${issueId} not visible.`, details);
      res.status(404).json({ error: Errors.NOT_FOUND });
      return;
    }

    const results = await Promise.all([
      r.table('issueChanges').filter({ issue: issueId }).delete().run(server.conn),
      r.table('issueLinks').filter({ to: issueId }).delete().run(server.conn),
      r.table('issueLinks').filter({ from: issueId }).delete().run(server.conn),
      r.table('issues').get(issueId).delete().run(server.conn),
      // TODO: Add comments, attachments
    ]);

    const errorResponse = results.find(resp => resp.errors > 0);
    if (errorResponse) {
      logger.error('Error creating issue', errorResponse.first_error);
      res.status(500).json({ error: Errors.INTERNAL, details: errorResponse.first_error });
    } else {
      res.end();
    }
  }
});
