import * as React from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { session } from '../../models';
// import { toast } from 'react-toastify';
import bind from 'bind-decorator';

const noop: () => void = () => null;

@observer
export class EmailVerificationDialog extends React.Component<undefined> {
  public render() {
    return (
      <Modal dialogClassName="email-verification-dialog" onHide={noop} show={true}>
        <Modal.Header>
          <Modal.Title>Email Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <p>
              A verification email has been sent to {session.account.email}. Please click on
              the link in the email to activate your account.
            </p>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={this.onClickSend}>
            Re-send verification email.
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  @bind
  private onClickSend() {
    const url = new URL(window.location.toString());
    url.pathname = '/projects';
    url.search = '';
    // authModel.user.sendEmailVerification({ url: url.toString() }).then(() => {
    //   toast.success(`Verification email sent.`);
    // });
  }
}
