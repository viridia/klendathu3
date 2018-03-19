import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Project } from '../../../../models';
import bind from 'bind-decorator';
import { AccountName } from '../../../common/AccountName';
import { displayErrorToast } from '../../../common/displayErrorToast';
import { removeProjectRole } from '../../../../network/requests';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

import './SetRoleDialog.scss';

interface Props {
  user?: string;
  project: Project;
  onHide: () => void;
}

@observer
export class RemoveMemberDialog extends React.Component<Props> {
  @observable private busy = false;

  public render() {
    const { user } = this.props;
    return (
      <Modal
          show={true}
          onHide={this.props.onHide}
          dialogClassName="set-role"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>Remove <AccountName id={user} /> from project?</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancel</Button>
          <Button
              onClick={this.onSubmit}
              disabled={this.busy}
              bsStyle="primary"
          >
            Remove
          </Button>
        </Modal.Footer>
      </Modal>);
  }

  @bind
  private onSubmit() {
    const { project, user, onHide } = this.props;
    this.busy = true;
    return removeProjectRole(project.account, project.uname, user)
    .then(result => {
      this.busy = false;
      onHide();
    }, displayErrorToast);
  }
}
