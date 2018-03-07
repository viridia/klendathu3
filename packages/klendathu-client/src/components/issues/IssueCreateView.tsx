import * as React from 'react';
import { IssueListQuery, Project } from '../../models';
import { createIssue } from '../../network/requests';
import { IssueCompose } from './IssueCompose';
import bind from 'bind-decorator';
import { IssueInput } from 'klendathu-json-types';

interface Props {
  project: Project;
  issues: IssueListQuery;
}

export class IssueCreateView extends React.Component<Props> {
  public render() {
    return (
      <IssueCompose project={this.props.project} issues={this.props.issues} onSave={this.onSave} />
    );
  }

  @bind
  private onSave(input: IssueInput): Promise<any> {
    const { project } = this.props;
    return createIssue(project.account, project.uname, input);
  }
}
