import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { IssueListQuery, Memberships, Project, projects } from '../../models';
// import { ProjectPrefsQuery } from '../../models/ProjectPrefsQuery';
import { observer } from 'mobx-react';
import { IssueCreateView } from '../issues/IssueCreateView';
import { IssueEditView } from '../issues/IssueEditView';
// import { IssueListView } from '../issues/IssueListView';
// import { IssueDetailsView } from '../issues/IssueDetailsView';
// import { LabelListView } from '../labels/LabelListView';

interface Props {
  account: string;
  project: string;
  memberships: Memberships;
}

@observer
export class ProjectContentArea extends React.Component<Props> {
  private project: Project;
  private issues: any;
  // private issues: IssueListQuery;
  // private prefs: ProjectPrefsQuery;

  public componentWillMount() {
    const { account, project, memberships } = this.props;
    this.project = projects.get(account, project, memberships);
    // this.issues = new IssueListQuery(this.project);
    // this.prefs = new ProjectPrefsQuery(owner, project);
  }

  public componentWillUnmount() {
    this.project.release();
    // this.issues.release();
    // this.prefs.release();
  }

  // <Route path="/:owner/:project/settings/:tab" render={this.renderProjectSettings} />
  // <Route path="/:owner/:project/settings" render={this.renderProjectSettings} />
  // <Route path="/:owner/:project" />

  public render() {
    if (this.project.loaded) {
      return(
        <Switch>
          <Route
              path="/:owner/:project/new"
              render={() => (
                <IssueCreateView project={this.project} issues={this.issues} />)}
          />
          <Route
              path="/:owner/:project/edit/:id"
              render={props => (
                <IssueEditView {...props} project={this.project} issues={this.issues} />)}
          />
          {/*<Route
              path="/:owner/:project/issues/:id"
              render={props => (<IssueDetailsView {...props} project={this.project} />)}
          />*/}
          {/*<Route
              path="/:owner/:project/issues"
              exact={true}
              render={() => (
                <IssueListView
                    {...this.props}
                    project={this.project}
                    issues={this.issues}
                    prefs={this.prefs}
                />
              )}
          />*/}
          {/*<Route
              path="/:owner/:project/labels"
              exact={true}
              render={() => (<LabelListView project={this.project} />)}
          />*/}
        </Switch>
      );
    } else {
      return <div className="" />;
    }
  }
}
