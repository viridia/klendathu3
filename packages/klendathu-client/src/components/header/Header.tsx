import * as React from 'react';
import { SignInLink } from './SignInLink';
import { UserMenuButton } from './UserMenuButton';
import { NewIssueButton } from './NewIssueButton';
import { RouteComponentProps, Route, Switch } from 'react-router-dom';

import './Header.scss';

export function Header(props: RouteComponentProps<{}>) {
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
        <Route path="/:account/:project" component={NewIssueButton} />
      </Switch>
      <UserMenuButton {...props} />
    </header>
  );
}
