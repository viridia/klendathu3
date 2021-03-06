import * as React from 'react';
import bind from 'bind-decorator';
import { Errors } from 'klendathu-json-types';
import { Button, ControlLabel, FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { action, observable } from 'mobx';
import { createUserAccount } from '../../network/requests';
import { RequestError } from '../../network';
import { observer } from 'mobx-react';

import './SignUpForm.scss';

@observer
export class SignUpForm extends React.Component<RouteComponentProps<{}>> {
  @observable private email: string = '';
  @observable private emailError: string = '';
  @observable private password: string = '';
  @observable private passwordError: string = '';
  @observable private password2: string = '';
  @observable private password2Error: string = '';

  public render() {
    const { next } = this.props.location.state || { next: undefined };
    const canSubmit =
        this.email.length > 0 &&
        this.password.length > 0 &&
        this.password2.length > 0;
    return (
      <form className="signup-form card" onSubmit={this.onSubmit}>
        <FormGroup controlId="email" validationState={this.emailError ? 'error' : null}>
          <ControlLabel>Email</ControlLabel>
          <FormControl
              type="text"
              value={this.email}
              placeholder="Enter email address"
              autoComplete="email"
              onChange={this.onChangeEmail}
          />
          <FormControl.Feedback />
          <HelpBlock>{this.emailError}</HelpBlock>
        </FormGroup>
        <FormGroup controlId="password" validationState={this.passwordError ? 'error' : null}>
          <ControlLabel>Password</ControlLabel>
          <FormControl
              type="password"
              value={this.password}
              placeholder="Choose a password"
              autoComplete="new-password"
              onChange={this.onChangePassword}
          />
          <FormControl.Feedback />
          <HelpBlock>{this.passwordError}</HelpBlock>
        </FormGroup>
        <FormGroup
            controlId="confirm_password"
            validationState={this.password2Error ? 'error' : null}
        >
          <ControlLabel>Confirm Password</ControlLabel>
          <FormControl
              type="password"
              value={this.password2}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              onChange={this.onChangePassword2}
          />
          <FormControl.Feedback />
          <HelpBlock>{this.password2Error}</HelpBlock>
        </FormGroup>
        <div className="button-row">
          <LinkContainer to={{ ...this.props.location, pathname: '/account/login' }}>
            <Button bsStyle="link">Sign In</Button>
          </LinkContainer>
          <LinkContainer to={next || { pathname: '/' }}>
            <Button bsStyle="default">Cancel</Button>
          </LinkContainer>
          <Button bsStyle="primary" type="submit" disabled={!canSubmit}>
            Create Account
          </Button>
        </div>
      </form>
    );
  }

  @action.bound
  private onSubmit(ev: any) {
    ev.preventDefault();

    this.emailError = '';
    this.passwordError = '';
    this.password2Error = '';
    if (this.password !== this.password2) {
      this.password2Error = 'Password doesn\'t match.';
      return;
    }

    createUserAccount(this.email, this.password).then(account => {
      this.props.history.replace('/');
    }, (error: RequestError) => {
      switch (error.code) {
        case Errors.INVALID_EMAIL:
          this.emailError = 'Invalid email address.';
          break;

        case Errors.PASSWORD_TOO_SHORT:
          this.passwordError = 'The password should be at least 6 characters.';
          break;

        case Errors.EXISTS:
          this.passwordError = 'The email address is already in use by another account.';
          break;

        default:
          this.emailError = error.message || error.code;
          break;
      }
    });
  }

  @bind
  private onChangeEmail(e: any) {
    this.email = e.target.value;
  }

  @bind
  private onChangePassword(e: any) {
    this.password = e.target.value;
  }

  @bind
  private onChangePassword2(e: any) {
    this.password2 = e.target.value;
  }
}
