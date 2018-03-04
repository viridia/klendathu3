import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Header } from '../header/Header';
// import { LeftNav } from '../nav/LeftNav';
// import { SettingsView } from '../settings/SettingsView';
// import { ProjectListView } from '../projects/ProjectListView';
import { SetupAccountDialog } from '../settings/SetupAccountDialog';
// import { EmailVerificationDialog } from '../settings/EmailVerificationDialog';
// import { ProjectContentArea } from './ProjectContentArea';
import { ToastContainer } from 'react-toastify';
import { session } from '../../models/Session';
import { observer } from 'mobx-react';

import './MainPage.scss';

@observer
export class MainPage extends React.Component<RouteComponentProps<{}>> {
  public componentWillMount() {
    if (!session.isLoggedIn) {
      session.resume(this.props.location, this.props.history);
    }
  }

  public componentWillUpdate() {
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
        <Header {...this.props} />
        <section className="main-body">
          {/*<LeftNav {...this.props} />*/}
          <Switch>
            {/*<Route path="/settings" component={SettingsView} />
            <Route path="/projects" component={ProjectListView} />
            <Route path="/:owner/:project?" component={ProjectContentArea} />
            <Route component={ProjectListView} />*/}
            <Route />
          </Switch>
        </section>
        {/*{showEmailVerification && <EmailVerificationDialog />}*/}
        {!showEmailVerification && showSetupAccount && <SetupAccountDialog />}
      </section>
    );
  }
}
