import * as React from 'react';
import { issues } from '../../models';
import { observer } from 'mobx-react';

interface Props {
  id: string;
}

/** Component that displays an issue as a single-line summary. */
@observer
export class IssueSummary extends React.Component<Props> {
  public render() {
    const { id } = this.props;
    const issue = issues.get(id);
    if (issue) {
      return (
        <span className="issue">
          <span className="id">#{issue.id}</span>
          <span className="summary">: {issue.summary}</span>
        </span>);
    } else {
      return (
        <span className="issue">
          <span className="id">#{id}</span>
          <span className="summary unknown">: unknown issue</span>
        </span>);
    }
  }
}
