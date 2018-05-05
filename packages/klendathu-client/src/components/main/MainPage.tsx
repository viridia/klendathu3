import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Header } from '../header/Header';
import { LeftNav } from '../nav/LeftNav';
import { SettingsView } from '../settings/SettingsView';
import { ProjectListView } from '../projects/ProjectListView';
import { SetupAccountDialog } from '../settings/SetupAccountDialog';
import { DependenciesView } from '../dependencies/DependenciesView';
import { EmailVerificationDialog } from '../settings/EmailVerificationDialog';
import { HistoryListView } from '../history/HistoryListView';
import { IssueCreateView } from '../issues/IssueCreateView';
import { IssueEditView } from '../issues/IssueEditView';
import { IssueListView } from '../issues/IssueListView';
import { IssueDetailsView } from '../issues/IssueDetailsView';
import { LabelListView } from '../labels/LabelListView';
import { ProgressView } from '../progress/ProgressView';
import { SavedFiltersView } from '../filters/SavedFiltersView';
import { ProjectSettings } from '../projects/settings';
import { AccountProvider } from '../common/AccountProvider';
import { ProjectProvider } from '../common/ProjectProvider';
import { ToastContainer } from 'react-toastify';
import { Memberships, session } from '../../models';
import { observer } from 'mobx-react';

import './MainPage.scss';

@observer
export class MainPage extends React.Component<RouteComponentProps<{}>> {
  private memberships: Memberships;

  public componentWillMount() {
    this.memberships = new Memberships();
    if (!session.isLoggedIn) {
      session.resume(this.props.location, this.props.history);
    }
  }

  public componentWillUpdate() {
    this.memberships.release();
    if (!session.isLoggedIn) {
      session.resume(this.props.location, this.props.history);
    }
  }

  public render() {
    // If the name record for the current user has not been loaded yet, show nothing.
    if (!session.isLoggedIn) {
      return null;
    }
    const showSetupAccount =
        session.isLoggedIn && session.account &&
        !(session.account.uname && session.account.display);
    const showEmailVerification =
        session.isLoggedIn && session.account && !session.account.verified;
    return(
      <section className="kdt page main">
        <ToastContainer
            position="bottom-right"
            autoClose={10000}
            hideProgressBar={true}
            newestOnTop={false}
        />
        <Header {...this.props} memberships={this.memberships} />
        <section className="main-body">
          <LeftNav {...this.props} />
          <Switch>
            <Route path="/settings" component={SettingsView} />
            <Route
                path="/projects"
                render={() => <ProjectListView memberships={this.memberships} />}
            />
            <Route
                path="/:account/:project"
                render={({ match }) => (
                  <AccountProvider account={match.params.account}>
                    {account => (
                      <ProjectProvider
                          account={account}
                          project={match.params.project}
                          memberships={this.memberships}
                      >
                        {models => (
                          <Switch>
                            <Route
                                path="/:account/:project/new"
                                render={props => <IssueCreateView {...props} {...models} />}
                            />
                            <Route
                                path="/:account/:project/edit/:id"
                                render={props => <IssueEditView {...props} {...models} />}
                            />
                            <Route
                                path="/:account/:project/:id(\d+)"
                                render={props => (<IssueDetailsView {...props} {...models} />)}
                            />
                            <Route
                                path="/:account/:project/issues"
                                exact={true}
                                render={props => (<IssueListView {...props} {...models}/>)}
                            />
                            <Route
                                path="/:account/:project/labels"
                                exact={true}
                                render={() => (<LabelListView {...models} />)}
                            />
                            <Route
                                path="/:account/:project/filters"
                                exact={true}
                                render={props => (<SavedFiltersView {...props} {...models}/>)}
                            />
                            <Route
                                path="/:account/:project/history"
                                exact={true}
                                render={props => (<HistoryListView {...props} {...models}/>)}
                            />
                            <Route
                                path="/:account/:project/progress"
                                exact={true}
                                render={props => (<ProgressView {...props} {...models}/>)}
                            />
                            <Route
                                path="/:account/:project/dependencies"
                                exact={true}
                                render={props => (<DependenciesView {...props} {...models}/>)}
                            />
                            <Route
                                path="/:account/:project/settings/:tab?"
                                exact={true}
                                render={props => (<ProjectSettings {...props} {...models} />)}
                            />
                          </Switch>
                        )}
                      </ProjectProvider>
                    )}
                  </AccountProvider>
                )}
            />
            <Route render={() => <ProjectListView memberships={this.memberships} />} />
          </Switch>
        </section>
        {showEmailVerification && <EmailVerificationDialog />}
        {!showEmailVerification && showSetupAccount && <SetupAccountDialog />}
      </section>
    );
  }
}
