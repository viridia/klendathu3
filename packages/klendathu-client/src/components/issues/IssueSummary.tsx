import * as React from 'react';
import { IssueListQuery } from '../../models';

// import './LabelName.scss';

interface Props {
  id: string;
  issues: IssueListQuery;
}

/** Component that displays an issue as a single-line summary. */
export function IssueSummary(props: Props) {
  const issue = props.issues.byId(props.id);
  if (issue) {
    return (
      <span className="issue">
        <span className="id">#{issue.id}</span>
        <span className="summary">: {issue.summary}</span>
      </span>);
  } else {
    return (
      <span className="issue">
        <span className="id">#{props.id}</span>
        <span className="summary unknown">: unknown issue</span>
      </span>);
  }
}
