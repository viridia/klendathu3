import * as React from 'react';
import { observer } from 'mobx-react';
import { Account as AccountData } from 'klendathu-json-types';
import { IssueListQuery, Memberships, Project, projects } from '../../models';
// import { ProjectPrefsQuery } from '../../models/ProjectPrefsQuery';

interface OutProps {
  account: AccountData;
  project: Project;
  issues: IssueListQuery;
}

interface Props {
  account: AccountData;
  project: string;
  memberships: Memberships;
  children: (props: OutProps) => React.ReactNode;
}

/** Component which provides project and issue objects to it's children. */
@observer
export class ProjectProvider extends React.Component<Props> {
  private project: Project = null;
  private issues: IssueListQuery = null;
  // private prefs: ProjectPrefsQuery;

  public componentWillMount() {
    const { account, project, memberships } = this.props;
    this.project = projects.get(account.uid, project, memberships);
  }

  public componentWillReceiveProps(nextProps: Props) {
    const { account, project, memberships } = nextProps;
    if (this.project.account !== account.uid || this.project.uname !== project) {
      this.project.release();
      this.project = projects.get(account.uid, project, memberships);
    }
  }

  public render() {
    const { children, account } = this.props;
    const project = this.project;
    const issues = this.issues;
    return project && project.loaded ? children({ project, account, issues }) : null;
  }
}
