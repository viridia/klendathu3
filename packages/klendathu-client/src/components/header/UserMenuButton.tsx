import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { session } from '../../models/Session';
import bind from 'bind-decorator';
import { observer} from 'mobx-react';

@observer
export class UserMenuButton extends React.Component<RouteComponentProps<{}>> {
  public render() {
    if (!session.account || !session.account.uname) {
      return null;
    }
    const name = session.account && (session.account.display || session.account.uname);
    return (
      <DropdownButton
          bsStyle="primary"
          title={name}
          id="user-menu"
          pullRight={true}
      >
        <LinkContainer to={{ pathname: '/' }} exact={true}>
          <MenuItem eventKey="dashboard" disabled={!name}>Dashboard</MenuItem>
        </LinkContainer>
        <LinkContainer to={{ pathname: '/settings/account' }}>
          <MenuItem eventKey="profile" disabled={!name}>Settings</MenuItem>
        </LinkContainer>
        <MenuItem divider={true} />
        <MenuItem eventKey="sign-out" onClick={this.onSignOut}>Sign out</MenuItem>
      </DropdownButton>
    );
  }

  @bind
  private onSignOut(e: React.MouseEvent<{}>): void {
    e.preventDefault();
    session.logout();
    this.props.history.push({ pathname: '/account/login' });
  }
}
