import {
  Account,
  Change,
  Comment,
  Issue,
  IssueArc,
  Label,
  Membership,
  Project,
  ProjectPrefs,
} from 'klendathu-json-types';
import {
  AccountRecord,
  CommentRecord,
  IssueRecord,
  IssueChangeRecord,
  IssueLinkRecord,
  LabelRecord,
  MembershipRecord,
  ProjectRecord,
  ProjectPrefsRecord,
} from './types';

export const encodeAccount: (record: AccountRecord) => Account = record => ({
  uid: record.id,
  uname: record.uname,
  display: record.display,
  photo: record.photo,
  type: record.type,
});

export const encodeIssue: (record: IssueRecord) => Issue = record => ({
  id: record.id,
  project: record.project,
  type: record.type,
  state: record.state,
  summary: record.summary,
  description: record.description,
  reporter: record.reporter,
  owner: record.owner,
  cc: record.cc,
  created: record.created.toJSON(),
  updated: record.updated.toJSON(),
  labels: record.labels,
  attachments: record.attachments,
  custom: record.custom,
  isPublic: record.isPublic,
});

export const encodeLabel: (record: LabelRecord) => Label = record => ({
  id: record.id,
  name: record.name,
  color: record.color,
  project: record.project,
  creator: record.creator,
  created: record.created,
  updated: record.updated,
});

export const encodeProject: (record: ProjectRecord) => Project = record => ({
  id: record.id,
  title: record.title,
  description: record.description,
  owner: record.owner,
  template: record.template,
  isPublic: record.isPublic,
  created: record.created.toJSON(),
  updated: record.updated.toJSON(),
});

export function encodeProjectPrefs(record: ProjectPrefsRecord): ProjectPrefs {
  return record;
}

export function encodeComment(record: CommentRecord): Comment {
  return record;
}

export function encodeIssueLink(record: IssueLinkRecord): IssueArc {
  return record;
}

export function encodeIssueChange(record: IssueChangeRecord): Change {
  return record;
}

export function encodeMembership(record: MembershipRecord): Membership {
  return record;
}
