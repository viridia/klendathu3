import * as React from 'react';
import { Nav, NavItem } from 'react-bootstrap';
import { Switch, Route } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { UserAccountForm } from './UserAccountForm';
import { OrganizationForm } from './OrganizationForm';
import { observer } from 'mobx-react';

import './SettingsView.scss';

function NavLink({ to, children, title }: {
    to: string | Location,
    children: React.ReactNode,
    title?: string;
  }) {
  return (
    <LinkContainer to={to}>
      <NavItem title={title}>{children}</NavItem>
    </LinkContainer>
  );
}

@observer
export class SettingsView extends React.Component<undefined> {
  public render() {
    return (
      <section className="kdt content settings-view">
        <header>Settings</header>
        <Nav bsStyle="tabs">
          <NavLink title="account" to="/settings/account">Account</NavLink>
          <NavLink title="organizations" to="/settings/orgs">Organizations</NavLink>
        </Nav>
        <Switch>
          <Route path="/settings/account" component={UserAccountForm} />
          <Route path="/settings/orgs" component={OrganizationForm} />
        </Switch>
      </section>
    );
  }
}
