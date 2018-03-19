import * as React from 'react';
import { Role } from 'klendathu-json-types';
import { Button, Modal } from 'react-bootstrap';
import { Project } from '../../../../models';
import bind from 'bind-decorator';
import { AccountName } from '../../../common/AccountName';
import { RoleSelector } from '../../../common/RoleSelector';
import { displayErrorToast } from '../../../common/displayErrorToast';
import { setProjectRole } from '../../../../network/requests';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

import './SetRoleDialog.scss';

interface Props {
  user?: string;
  project: Project;
  onHide: () => void;
}

@observer
export class SetRoleDialog extends React.Component<Props> {
  @observable private role: Role = Role.VIEWER;
  @observable private busy = false;

  public render() {
    const { project, user } = this.props;
    return (
      <Modal
          show={true}
          onHide={this.props.onHide}
          dialogClassName="set-role"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>Set Project Role for <AccountName id={user} /></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <RoleSelector value={this.role} maxRole={project.role} onChange={this.onSelectRole} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancel</Button>
          <Button
              onClick={this.onSubmit}
              disabled={this.role === null || this.busy}
              bsStyle="primary"
          >
            Set Role
          </Button>
        </Modal.Footer>
      </Modal>);
  }

  @bind
  private onSelectRole(role: Role) {
    this.role = role;
  }

  @bind
  private onSubmit() {
    const { project, user, onHide } = this.props;
    this.busy = true;
    return setProjectRole(project.account, project.uname, user, this.role)
    .then(result => {
      this.busy = false;
      onHide();
    }, displayErrorToast);
  }
}
