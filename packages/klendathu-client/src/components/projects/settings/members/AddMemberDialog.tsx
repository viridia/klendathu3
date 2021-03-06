import * as React from 'react';
import { Account, Role } from 'klendathu-json-types';
import { Button, Modal } from 'react-bootstrap';
import { Project } from '../../../../models';
import bind from 'bind-decorator';
import { UserAutocomplete } from '../../../common/UserAutocomplete';
import { RoleSelector } from '../../../common/RoleSelector';
import { displayErrorToast } from '../../../common/displayErrorToast';
import { setProjectRole } from '../../../../network/requests';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

import './AddMemberDialog.scss';

interface Props {
  project: Project;
  onHide: () => void;
}

@observer
export class AddMemberDialog extends React.Component<Props> {
  @observable private role: Role = Role.VIEWER;
  @observable private user: Account = null;
  @observable private busy = false;

  public render() {
    const { project } = this.props;
    return (
      <Modal
          show={true}
          onHide={this.props.onHide}
          dialogClassName="add-member"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>Add Project Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UserAutocomplete
              placeholder="select user..."
              selection={this.user}
              autoFocus={true}
              onSelectionChange={this.onChangeUser}
          />
          <RoleSelector value={this.role} maxRole={project.role} onChange={this.onSelectRole} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancel</Button>
          <Button
              onClick={this.onAddMember}
              disabled={this.user === null || this.role === null || this.busy}
              bsStyle="primary"
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>);
  }

  @bind
  private onChangeUser(selection: Account) {
    this.user = selection;
  }

  @bind
  private onSelectRole(role: Role) {
    this.role = role;
  }

  @bind
  private onAddMember() {
    const { project, onHide } = this.props;
    this.busy = true;
    return setProjectRole(project.account, project.uname, this.user.uid, this.role)
    .then(result => {
      this.busy = false;
      onHide();
    }, displayErrorToast);
  }
}
