import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { displayErrorToast } from '../common/displayErrorToast';
import { verifyEmail } from '../../network/requests';
import * as qs from 'qs';

import './LoginForm.scss';

export class VerifyEmailForm extends React.Component<RouteComponentProps<{}>> {
  public componentWillMount() {
    const { location, history } = this.props;
    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    if (query.email && query.token) {
      verifyEmail(query.email, query.token).then(() => {
        history.replace('/');
      }, displayErrorToast);
      console.log(query.email && query.token);
    }
  }

  public render() {
    return (
      <div className="login-form card">
        Verifying email address&hellip;
      </div>
    );
  }
}
