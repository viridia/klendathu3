import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
// import { Header } from '../header/Header';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { VerifyEmailForm } from './VerifyEmailForm';
import { ToastContainer } from 'react-toastify';

import './AccountPage.scss';

export class AccountPage extends React.Component<RouteComponentProps<{}>> {
  public render() {
    return (
      <section className="kdt page account">
        <ToastContainer
            position="bottom-right"
            autoClose={10000}
            hideProgressBar={true}
            newestOnTop={false}
        />
        {/*<Header {...this.props} />*/}
        <section className="account-content">
          <div className="spacer before" />
          <Switch>
            <Route path="/account/login" component={LoginForm} />
            <Route path="/account/register" component={SignUpForm} />
            <Route path="/account/verify" component={VerifyEmailForm} />
            {/*<Route path="/account/activate" />*/}
            <Route path="/account/recover" />
            <Route path="/account/reset" />
          </Switch>
          <div className="spacer after" />
        </section>
      </section>
    );
  }
}
