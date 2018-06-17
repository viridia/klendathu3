import * as React from 'react';
import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  HelpBlock,
} from 'react-bootstrap';
import { Errors } from 'klendathu-json-types';
import { LinkContainer } from 'react-router-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { session } from '../../models';
import { RequestError } from '../../network/RequestError';

import './LoginForm.scss';

import * as googleImg from '../../../icons/google.png';
import * as githubImg from '../../../icons/github.png';
import * as facebookImg from '../../../icons/facebook.png';

@observer
export class LoginForm extends React.Component<RouteComponentProps<{}>> {
  @observable private email: string = '';
  @observable private emailError: string = '';
  @observable private password: string = '';
  @observable private passwordError: string = '';
  @observable private visible = false;

  public componentWillMount() {
    // Make sure there's no stored token, so that social login doesn't get confused.
    session.logout();
    this.visible = true;
  }

  public render() {
    if (!this.visible) {
      return null;
    }
    const { location } = this.props;
    // console.log('location', location);
    let nextUrl = '';
    if (location.state && location.state.next) {
      const loc = this.props.history.createHref(location.state.next);
      nextUrl = `?next=${encodeURIComponent(loc)}`;
    }
    const canSubmit = this.email.length > 1 && this.password.length > 1;
    return (
      <Form className="login-form card" onSubmit={this.onSubmit}>
        <div className="username-login">
          <FormGroup
              controlId="username"
              validationState={this.emailError ? 'error' : null}
          >
            <ControlLabel>Email</ControlLabel>
            <FormControl
                type="text"
                value={this.email}
                placeholder="Enter user name"
                autoComplete="email"
                onChange={this.onChangeUserName}
            />
            <FormControl.Feedback />
            <HelpBlock>{this.emailError}</HelpBlock>
          </FormGroup>
          <FormGroup
              controlId="password"
              validationState={this.passwordError ? 'error' : null}
          >
            <ControlLabel>Password</ControlLabel>
            <FormControl
                type="password"
                value={this.password}
                autoComplete="password"
                placeholder="Enter password"
                onChange={this.onChangePassword}
                name="password"
            />
            <FormControl.Feedback />
            <HelpBlock>{this.passwordError}</HelpBlock>
          </FormGroup>
          <div className="button-row">
            <section>
              <LinkContainer to={{ ...this.props.location, pathname: '/account/register' }}>
                <Button bsStyle="link">Create Account</Button>
              </LinkContainer>
              <LinkContainer to={{ ...this.props.location, pathname: '/account/recover' }}>
                <Button bsStyle="link">Forgot Password?</Button>
              </LinkContainer>
            </section>
            <Button bsStyle="primary" type="submit" disabled={!canSubmit}>Sign In</Button>
          </div>
        </div>
        <div className="divider" />
        <div className="providers">
          <Button bsStyle="primary" className="google"  href={`/auth/google${nextUrl}`}>
            <img className="logo" src={googleImg} />
            Login with Google
          </Button>
          <Button bsStyle="primary" className="github" href="/auth/github">
            <img className="logo" src={githubImg} />
            Login with Github
          </Button>
          <Button
              bsStyle="primary"
              className="facebook"
              href="/auth/facebook"
              disabled={true}
          >
            <img className="logo" src={facebookImg} />
            Login with Facebook
          </Button>
        </div>
      </Form>
    );
  }

  @action.bound
  private onChangeUserName(e: any) {
    this.email = e.target.value;
  }

  @action.bound
  private onChangePassword(e: any) {
    this.password = e.target.value;
  }

  @action.bound
  private onSubmit(e: any) {
    e.preventDefault();
    this.emailError = '';
    this.passwordError = '';
    session.login(this.email, this.password).then(result => {
      this.props.history.replace('/');
    }, (error: RequestError) => {
      switch (error.code) {
        case Errors.NOT_FOUND:
          this.emailError = 'Unknown email address.';
          break;
        case Errors.INCORRECT_PASSWORD:
          this.emailError = 'Incorrect password for this email address.';
          break;
        default:
          this.emailError = error.message || error.code;
          break;
      }
    });
  }
}
