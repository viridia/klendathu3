import {
  Account,
  Change,
  CustomFieldChange,
  LinkChange,
} from 'klendathu-json-types';
import * as React from 'react';
import { relationNames } from '../common/relationNames';
import { IssueSummary } from '../issues/IssueSummary';
import { LabelName } from '../common/LabelName';
import { RelativeDate } from '../common/RelativeDate';
import { AccountName } from '../common/AccountName';
import { Project } from '../../models';

export function ChangeEntry({ change, project, account }:
    { change: Change, project: Project, account: Account }) {
  function linkChange({ to, before, after }: LinkChange) {
    if (before && after) {
      return (
        <li className="field-change linked-issue" key={to}>
          changed <span className="relation">{relationNames[before]} </span>
          &nbsp;%raquo;&nbsp;
          <span className="relation">{relationNames[after]}</span>
          <IssueSummary id={to} project={project} account={account} key={to} />
        </li>
      );
    } else if (before) {
      return (
        <li className="field-change linked-issue" key={to}>
          removed <span className="relation">{relationNames[before]} </span>
          <IssueSummary id={to} project={project} account={account} key={to} />
        </li>
      );
    } else {
      return (
        <li className="field-change linked-issue" key={to}>
          added <span className="relation">{relationNames[after]} </span>
          <IssueSummary id={to} project={project} account={account} key={to} />
        </li>
      );
    }
  }

  function customValue(value: string | number | boolean) {
    return value !== null
      ? <span className="custom-value">{value || '""'}</span>
      : <span className="custom-value-none">(none)</span>;
  }

  function customChange({ name, before, after }: CustomFieldChange) {
    return (
      <li className="field-change custom-field" key={name}>
        changed <span className="field-name">
          {name}
        </span> from {customValue(before)} to {customValue(after)}
      </li>);
  }

  function stateName(state: string) {
    const st = project.template.getState(state);
    return st && st.caption || state;
  }

  return (
    <section className="change">
      <header className="change-header">
        <AccountName id={change.by} full={true} />
        &nbsp;made changes&nbsp;
        <RelativeDate date={change.at} />
        :
      </header>
      <ul className="field-change-list">
        {change.type && (
          <li className="field-change">
            type: <span className="type">
              {change.type.before}
            </span> to <span className="type">
              {change.type.after}
            </span>
          </li>)}
        {change.state && (
          <li className="field-change">
            state: <span className="state">
              {stateName(change.state.before)}
            </span> to <span className="state">
              {stateName(change.state.after)}
            </span>
          </li>)}
        {change.summary && (<li className="field-change">
          changed <span className="field-name">summary</span> from &quot;
          {change.summary.before}&quot; to &quot;
          {change.summary.after}&quot;
        </li>)}
        {change.description && (<li className="field-change">
          changed <span className="field-name">description</span>.
        </li>)}
        {change.owner &&
          <li className="field-change">owner:{' '}
          <AccountName id={change.owner.before} full={true} />
          {' '}to{' '}
          <AccountName id={change.owner.after} full={true} />
          </li>}
        {change.cc && change.cc.added && change.cc.added.map(cc => (
          <li className="field-change" key={cc}>
            added <AccountName id={cc} full={true} /> to cc</li>))}
        {change.cc && change.cc.removed && change.cc.removed.map(cc => (
          <li className="field-change" key={cc}>
            removed <AccountName id={cc} full={true} /> from cc</li>))}
        {change.labels && change.labels.added && change.labels.added.map(l =>
          (<li className="field-change" key={l}>
            added label <LabelName label={l} key={l} />
          </li>))}
        {change.labels && change.labels.removed && change.labels.removed.map(l =>
          (<li className="field-change" key={l}>
            removed label <LabelName label={l} key={l} />
          </li>))}
        {change.attachments && change.attachments.added && change.attachments.added.map(a =>
          (<li className="field-change" key={a}>
            attached file <span className="attachment" />
          </li>))}
        {change.attachments && change.attachments.removed &&
            change.attachments.removed.map(a =>
          (<li className="field-change" key={a}>
            removed file <span className="attachment" />
          </li>))}
        {change.linked && change.linked.map(linkChange)}
        {change.custom && change.custom.map(customChange)}
        {change.comments && change.comments.added === 1 &&
          (<li className="field-change">added a comment</li>)
        }
        {change.comments && change.comments.added > 1 &&
          (<li className="field-change">added {change.comments.added} comments</li>)
        }
        {change.comments && change.comments.updated === 1 &&
          (<li className="field-change">edited a comment</li>)
        }
        {change.comments && change.comments.updated > 1 &&
          (<li className="field-change">edited {change.comments.updated} comments</li>)
        }
        {change.comments && change.comments.removed === 1 &&
          (<li className="field-change">deleted a comment</li>)
        }
        {change.comments && change.comments.removed > 1 &&
          (<li className="field-change">deleted {change.comments.removed} comments</li>)
        }
      </ul>
    </section>
  );
}
