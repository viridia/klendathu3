import bind from 'bind-decorator';
import * as React from 'react';
import {
  Button, Checkbox, ControlLabel, FormControl, FormGroup, HelpBlock, Modal,
} from 'react-bootstrap';
import { AutoNavigate } from '../common/AutoNavigate';
import { AxiosError } from 'axios';
import { session, request } from '../../models/Session';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

import AddBoxIcon from '../../../icons/ic_add_box.svg';

interface Props {
  show: boolean;
  onHide: () => void;
}

@observer
export class CreateProjectDialog extends React.Component<Props> {
  @observable private projectName: string = '';
  @observable private projectNameError: string = null;
  @observable private projectTitle: string = '';
  @observable private projectTitleError: string = null;
  @observable private public: boolean = false;
  @observable private busy: boolean = false;

  public render() {
    return (
      <Modal
          show={this.props.show}
          onHide={this.props.onHide}
          dialogClassName="create-project"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>Create Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="create-project-form" onSubmit={this.onCreate}>
            <AutoNavigate />
            <FormGroup
                controlId="project_name"
                validationState={this.projectNameError ? 'error' : null}
            >
              <ControlLabel>Project Id</ControlLabel>
              <FormControl
                  autoFocus={true}
                  type="text"
                  label="Project Name"
                  value={this.projectName}
                  onChange={this.onChangeProjectName}
              />
            </FormGroup>
            <HelpBlock>{this.projectNameError}</HelpBlock>
            <FormGroup
                controlId="project_title"
                validationState={this.projectTitleError ? 'error' : null}
            >
              <ControlLabel>Project Title</ControlLabel>
              <FormControl
                  type="text"
                  label="Project Title"
                  value={this.projectTitle}
                  onChange={this.onChangeProjectTitle}
              />
            </FormGroup>
            <HelpBlock>{this.projectTitleError}</HelpBlock>
            <Checkbox checked={this.public} onChange={this.onChangePublic}>
              Public
            </Checkbox>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancel</Button>
          <Button
              onClick={this.onCreate}
              disabled={this.projectName.length === 0 || this.busy}
              bsStyle="primary"
          >
            <AddBoxIcon />
            Create Project
          </Button>
        </Modal.Footer>
      </Modal>);
  }

  @action.bound
  private onCreate(ev: any) {
    ev.preventDefault();
    this.busy = true;
    request.post(`/api/projects/${session.userId}/${this.projectName}`, {
      title: this.projectTitle,
      public: this.public,
    }).then(() => {
      this.clearForm();
      this.props.onHide();
    }, (error: AxiosError) => {
      this.busy = false;
      if (error.response && error.response.data.error) {
        switch (error.response.data.error) {
          case 'name-exists':
            this.projectNameError = 'A project with this name already exists.';
            break;
          case 'name-required':
            this.projectNameError = 'Project name cannot be empty.';
            break;
          case 'invalid-name':
            this.projectNameError =
              'Project name may only contain lower-case letters, numbers and hyphens.';
            break;
          default:
            if (error.message) {
              console.error('Server error:', error.message);
            } else {
              console.error('Unrecognized error code:', error.response.statusText);
            }
            this.projectNameError = 'Internal server error.';
            break;
        }
      } else {
        this.projectNameError = 'Internal server error.';
        console.error('create project error:', error);
      }
    });
  }

  @bind
  private onChangeProjectName(e: any) {
    this.projectName = e.target.value;
  }

  @bind
  private onChangePublic(e: any) {
    this.public = e.target.checked;
  }

  @bind
  private onChangeProjectTitle(e: any) {
    this.projectTitle = e.target.value;
  }

  @action.bound
  private clearForm() {
    this.busy = false;
    this.public = false;
    this.projectName = '';
    this.projectNameError = null;
    this.projectTitle = '';
    this.projectTitleError = null;
  }
}
