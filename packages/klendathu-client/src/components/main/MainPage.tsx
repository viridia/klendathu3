import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Header } from '../header/Header';
import { LeftNav } from '../nav/LeftNav';
import { SettingsView } from '../settings/SettingsView';
import { ProjectListView } from '../projects/ProjectListView';
import { SetupAccountDialog } from '../settings/SetupAccountDialog';
// import { EmailVerificationDialog } from '../settings/EmailVerificationDialog';
import { ProjectContentArea } from './ProjectContentArea';
import { AccountProvider } from '../common/AccountProvider';
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
                render={() => (<ProjectListView memberships={this.memberships} />)}
            />
            <Route
                path="/:account/:project"
                render={({ match }) => (
                  <AccountProvider
                      account={match.params.account}
                      render={account => (
                        <ProjectContentArea
                            account={account.uid}
                            project={match.params.project}
                            memberships={this.memberships}
                        />
                      )}
                  />
                )}
            />
            <Route render={() => (<ProjectListView memberships={this.memberships} />)} />
          </Switch>
        </section>
        {/*{showEmailVerification && <EmailVerificationDialog />}*/}
        {!showEmailVerification && showSetupAccount && <SetupAccountDialog />}
      </section>
    );
  }
}
// return 'ProjectContentArea';
