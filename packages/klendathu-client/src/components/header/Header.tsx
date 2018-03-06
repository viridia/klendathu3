import * as React from 'react';
import { SignInLink } from './SignInLink';
import { AccountProvider } from '../common/AccountProvider';
import { UserMenuButton } from './UserMenuButton';
import { NewIssueButton } from './NewIssueButton';
import { Memberships } from '../../models';
import { RouteComponentProps, Route, Switch } from 'react-router-dom';

import './Header.scss';

interface Props extends RouteComponentProps<{}> {
  memberships: Memberships;
}

export function Header(props: Props) {
  return (
    <header className="kdt header">
      <span className="title">Klendathu</span>
      <span className="subtitle">
        <span> - </span>
        &ldquo;in order to <em>fight</em> the bug, we must <em>understand</em> the bug.&rdquo;
      </span>
      <Switch>
        <Route path="/account" />
        <Route path="/settings" />
        <Route path="/" component={SignInLink} />
      </Switch>
      <Switch>
        <Route path="/account" />
        <Route path="/settings" />
        <Route
            path="/:account/:project"
            render={p => (
              <AccountProvider account={p.match.params.account}>
                {account => (
                  <NewIssueButton
                      account={account}
                      project={p.match.params.project}
                      memberships={props.memberships}
                  />
                )}
              </AccountProvider>
            )}
        />
      </Switch>
      <UserMenuButton {...props} />
    </header>
  );
}
