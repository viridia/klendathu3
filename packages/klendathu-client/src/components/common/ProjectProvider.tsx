import * as React from 'react';
import { observer } from 'mobx-react';
import { Account } from 'klendathu-json-types';
import {
  IssueListQuery,
  Memberships,
  Project,
  ObservableProjectPrefs,
  projects,
  MilestoneListQuery,
} from '../../models';

interface OutProps {
  account: Account;
  project: Project;
  issues: IssueListQuery;
  milestones: MilestoneListQuery;
  prefs: ObservableProjectPrefs;
}

interface Props {
  account: Account;
  project: string;
  memberships: Memberships;
  children: (props: OutProps) => React.ReactNode;
}

/** Component which provides project and issue objects to it's children. */
@observer
export class ProjectProvider extends React.Component<Props> {
  private project: Project = null;
  private issues: IssueListQuery = null;
  private prefs: ObservableProjectPrefs = null;
  private milestones: MilestoneListQuery = null;

  public componentWillMount() {
    const { account, project, memberships } = this.props;
    this.project = projects.get(account.uid, project, memberships);
    this.prefs = new ObservableProjectPrefs(account.uid, project);
    this.milestones = new MilestoneListQuery(account.uid, project);
    this.issues = new IssueListQuery(account.uid, project);
  }

  public componentWillReceiveProps(nextProps: Props) {
    const { account, project, memberships } = nextProps;
    if (this.project.account !== account.uid || this.project.uname !== project) {
      this.project.release();
      this.prefs.release();
      this.milestones.release();
      this.project = projects.get(account.uid, project, memberships);
      this.prefs = new ObservableProjectPrefs(account.uid, project);
      this.milestones = new MilestoneListQuery(account.uid, project);
      this.issues = new IssueListQuery(account.uid, project);
    }
  }

  public componentWillUnmount() {
    this.project.release();
    this.prefs.release();
    this.milestones.release();
  }

  public render() {
    const { children, account } = this.props;
    const project = this.project;
    const issues = this.issues;
    const prefs = this.prefs;
    const milestones = this.milestones;
    return project && project.loaded ?
        children({ project, account, issues, prefs, milestones }) : null;
  }
}
