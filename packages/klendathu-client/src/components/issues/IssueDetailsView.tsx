import * as React from 'react';
import { Project } from '../../models';

import './IssueDetailsView.scss';

interface Props {
  project: Project;
}

export class IssueDetailsView extends React.Component<Props> {
  public render() {
    return (
      <section className="kdt issue-details">
        issue-details
      </section>
    );
  }
}
