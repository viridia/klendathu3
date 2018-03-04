import * as React from 'react';
import { Button, ControlLabel, Form, FormControl, FormGroup, Modal } from 'react-bootstrap';
import { UsernameEditor } from './UsernameEditor';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { session, request } from '../../models/Session';

const noop: () => void = () => null;

@observer
export class SetupAccountDialog extends React.Component<undefined> {
  @observable private busy = false;
  @observable private username: string = '';
  @observable private available = false;
  @observable private displayName: string = '';

  public componentWillMount() {
    this.displayName = session.account.display || '';
    this.username = session.account.uname || '';
    if (!this.username && session.account.email) {
      const m = session.account.email.match(/[A-Za-z][\w\-\.\_]*/);
      if (m) {
        this.username = m[0];
      }
    }
  }

  public render() {
    return (
      <Modal dialogClassName="account-setup-dialog" onHide={noop} show={true}>
        <Modal.Header>
          <Modal.Title>User Account Setup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <p>
              To complete your account setup, make sure your name appears the way you would like
              it to be presented.
            </p>
            <p>
              You will also need to choose a unique username.
            </p>
            <FormGroup id="display-name-editor">
              <ControlLabel>Name</ControlLabel>
              <FormControl
                  value={this.displayName}
                  onChange={this.onChangeDisplayName}
                  maxLength={64}
                  placeholder="How you want your name to be displayed"
                  autoFocus={true}
              />
            </FormGroup>
            <UsernameEditor
                initialValue=""
                value={this.username}
                onChangeUsername={this.onChangeUsername}
                onChangeAvailable={this.onChangeAvailable}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
              bsStyle="primary"
              disabled={this.busy || !this.available || this.displayName.length < 1}
              onClick={this.onClickSave}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  @action.bound
  private onChangeUsername(username: string) {
    this.username = username;
  }

  @action.bound
  private onChangeAvailable(available: boolean) {
    this.available = available;
  }

  @action.bound
  private onChangeDisplayName(e: any) {
    this.displayName = e.target.value;
  }

  @action.bound
  private onClickSave() {
    this.busy = true; // Note we never set this to false because dialog should auto-close.
    request.patch(`/api/accounts/me`, {
      uname: this.username,
      display: this.displayName,
    }).then(() => {
      // Reload the account data.
      session.reload();
    });
  }
}
