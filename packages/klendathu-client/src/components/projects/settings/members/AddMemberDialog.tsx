import bind from 'bind-decorator';
import { Membership, Project, Role, User } from 'common/api';
import * as React from 'react';
import { Button, DropdownButton, MenuItem, Modal } from 'react-bootstrap';
import { toastr } from 'react-redux-toastr';
import { setProjectRole } from '../../../../store/reducers/projectMembership';
import '../../../ac/Chip.scss';
import UserAutoComplete from '../../../common/UserAutocomplete';
import './AddMemberDialog.scss';

interface Props {
  project: Project;
  onHide: () => void;
  onAddMember: (membership: Membership) => void;
}

interface State {
  busy: boolean;
  user: User;
  role: number;
}

export default class AddMemberDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      user: null,
      role: null,
      busy: false,
    };
  }

  public render() {
    const { project } = this.props;
    const { user, role } = this.state;
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
          <UserAutoComplete
              project={project}
              placeholder="select user..."
              selection={user}
              autoFocus={true}
              onSelectionChange={this.onChangeUser}
          />
          {this.renderRoleSelector()}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancel</Button>
          <Button
              onClick={this.onAddMember}
              disabled={user === null || role === null || this.state.busy}
              bsStyle="primary"
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>);
  }

  private renderRoleSelector() {
    return (
      <DropdownButton
          bsSize="small"
          title={this.state.role === null
              ? 'select role...' : Role[this.state.role].toLowerCase()}
          id="select-role"
          onSelect={this.onSelectRole}
      >
        {Role.values
            .filter(level => level > 0)
            .map(level => (
              <MenuItem eventKey={level} key={level} active={level === this.state.role}>
                {Role[level].toLowerCase()}
              </MenuItem>))}
      </DropdownButton>
    );
  }

  @bind
  private onChangeUser(selection: User) {
    this.setState({ user: selection });
  }

  @bind
  private onSelectRole(role: any) {
    this.setState({ role });
  }

  @bind
  private onAddMember() {
    const { project } = this.props;
    const { user, role } = this.state;
    // e.preventDefault();
    this.setState({ busy: true });
    return setProjectRole(project.id, user.username, role).then(result => {
      this.setState({ busy: false });
      if (this.props.onAddMember) {
        this.props.onAddMember(result.data.setProjectRole);
      }
      this.props.onHide();
    }, error => {
      console.error(error);
      if (error.response && error.response.data && error.response.data.err) {
        toastr.error('Operation failed.', `Server returned '${error.response.data.err}'`);
      } else {
        toastr.error('Operation failed.', error.message);
      }
    });
  }
}
