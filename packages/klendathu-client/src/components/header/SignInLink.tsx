import * as React from 'react';
import { Button } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { session } from '../../models';
import { observer} from 'mobx-react';
import * as qs from 'qs';

@observer
export class SignInLink extends React.Component<RouteComponentProps<{}>> {
  public render() {
    if (!session.isLoggedIn) {
      return (
        <LinkContainer
          className="header-link"
          to={{
            pathname: '/account/login',
            search: `?${qs.stringify({ next: this.props.location.pathname })}`,
          }}
        >
          <Button bsStyle="link">Sign In</Button>
        </LinkContainer>
      );
    }
    return null;
  }
}
