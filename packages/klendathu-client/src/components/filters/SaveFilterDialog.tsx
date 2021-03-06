import * as React from 'react';
import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  HelpBlock,
  Modal,
} from 'react-bootstrap';
// import { toastr } from 'react-redux-toastr';
// import { updateProjectMembership } from '../../store/projectMembership';
import { Project } from '../../models';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

import AddBoxIcon from '../../../icons/ic_add_box.svg';

import './SaveFilterDialog.scss';

interface Props {
  project: Project;
  filter: string;
  onHide: () => void;
}

@observer
export class SaveFilterDialog extends React.Component<Props> {
  @observable private filterName = '';
  @observable private filterNameError: string = null;
  @observable private busy = false;

  constructor(props: Props, context: any) {
    super(props, context);
    this.onSave = this.onSave.bind(this);
    this.onChangeFilterName = this.onChangeFilterName.bind(this);
    this.state = {
      busy: false,
    };
  }

  public render() {
    // const { profile } = this.context;
    return (
      <Modal
          show={true}
          onHide={this.props.onHide}
          dialogClassName="save-filter"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>Create Filter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="save-filter-form" onSubmit={this.onSave}>
            <FormGroup
                controlId="filter_name"
                validationState={this.filterNameError ? 'error' : null}
            >
              <ControlLabel>Filter Name</ControlLabel>
              <FormControl
                  autoFocus={true}
                  type="text"
                  label="Project Name"
                  value={this.filterName}
                  onChange={this.onChangeFilterName}
              />
            </FormGroup>
            <HelpBlock>{this.filterNameError}</HelpBlock>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancel</Button>
          <Button
              onClick={this.onSave}
              disabled={this.filterName.length === 0 || this.busy}
              bsStyle="primary"
          >
            <AddBoxIcon />
            Save
          </Button>
        </Modal.Footer>
      </Modal>);
  }

  @action.bound
  private onSave(ev: any) {
    console.log('save');
    ev.preventDefault();
    // const { project } = this.props;
    // const newState = {
    //   filterNameError: null,
    //   busy: false,
    // };
    // this.busy = true;
    // return updateProjectMembership(project.id, this.context.profile.username, {
    //   addFilters: [{ name: this.filterName, value: this.props.filter }],
    // }).then(() => {
    //   this.busy = false;
    //   // if (this.props.onAddMember) {
    //   //   this.props.onAddMember(result.data.updateProjectMembership);
    //   // }
    //   this.props.onHide();
    // }, error => {
    //   console.error(error);
    //   if (error.response && error.response.data && error.response.data.err) {
    //     toastr.error('Operation failed.', `Server returned '${error.response.data.err}'`);
    //   } else {
    //     toastr.error('Operation failed.', error.message);
    //   }
    // });

    // createFilter({
    //   owningUser: this.state.owner,
    //   name: this.state.filterName,
    // }).then(_resp => {
    //   newState.filterName = '';
    //   this.setState(newState);
    //   this.props.onHide();
    // }, error => {
    //   if (error.graphQLErrors) {
    //     for (const e of error.graphQLErrors) {
    //       switch (e.details.error) {
    //         case 'name-exists':
    //           newState.projectNameError = 'A project with this name already exists.';
    //           break;
    //         case 'name-too-short':
    //           newState.projectNameError = 'Project name must be at least 6 characters.';
    //           break;
    //         case 'invalid-name':
    //           newState.projectNameError =
    //             'Project name may only contain lower-case letters, numbers and hyphens.';
    //           break;
    //         default:
    //           if (e.message) {
    //             console.error('Server error:', e.message);
    //           } else {
    //             console.error('Unrecognized error code:', e.message, e.details.error);
    //           }
    //           newState.projectNameError = 'Internal server error.';
    //           break;
    //       }
    //     }
    //   } else {
    //     newState.projectNameError = 'Internal server error.';
    //     console.error('create project error:', error);
    //   }
    //   this.setState(newState);
    // });
  }

  @action.bound
  private onChangeFilterName(e: any) {
    this.filterName = e.target.value;
  }
}
