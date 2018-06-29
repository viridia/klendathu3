import * as React from 'react';
import { Milestone, MilestoneStatus } from 'klendathu-json-types';
import {
  Button,
  Modal,
  FormControl,
  ControlLabel,
  DropdownButton,
  MenuItem,
} from 'react-bootstrap';
import * as DateTime from 'react-datetime';
import { Project } from '../../../../models';
import { displayErrorToast } from '../../../common/displayErrorToast';
import { createMilestone, updateMilestone } from '../../../../network/requests';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import bind from 'bind-decorator';

import './EditMilestoneDialog.scss';
import 'react-datetime/css/react-datetime.css'; // tslint:disable-line
import { AutoNavigate } from '../../../common/AutoNavigate';

const STATUS_LIST = [
  MilestoneStatus.ACTIVE,
  MilestoneStatus.PENDING,
  MilestoneStatus.STATIC,
  MilestoneStatus.CONCLUDED,
];

interface Props {
  project: Project;
  milestone?: Milestone;
  onHide: () => void;
}

@observer
export class EditMilestoneDialog extends React.Component<Props> {
  @observable private name: string = '';
  @observable private description: string = '';
  @observable private status: MilestoneStatus = MilestoneStatus.PENDING;
  @observable private start: Date = new Date();
  @observable private end: Date = new Date();
  @observable private busy = false;

  public componentWillMount() {
    const { milestone } = this.props;
    if (milestone) {
      this.name = milestone.name;
      this.description = milestone.description;
      this.status = milestone.status;
      this.start = new Date(milestone.startDate);
      this.end = new Date(milestone.endDate);
    }
  }

  public render() {
    const { milestone } = this.props;
    return (
      <Modal
          show={true}
          onHide={this.props.onHide}
          dialogClassName="edit-milestone"
          backdrop="static"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>
            {milestone ? 'Edit Project Milestone' : 'Add Project Milestone'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.onAddMilestone}>
            <AutoNavigate />
            <table className="form-table">
              <tbody>
                <tr>
                  <th className="header"><ControlLabel>Name:</ControlLabel></th>
                  <td>
                    <FormControl
                          className="title"
                          type="text"
                          placeholder="Milestone name"
                          autoFocus={true}
                          value={this.name}
                          onChange={this.onChangeName}
                    />
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Description:</ControlLabel></th>
                  <td>
                    <FormControl
                          className="description"
                          type="text"
                          placeholder="Milestone description"
                          value={this.description}
                          onChange={this.onChangeDescription}
                    />
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Status:</ControlLabel></th>
                  <td>
                    <DropdownButton
                        title={this.status}
                        id="milestone-status"
                        onSelect={this.onSelectStatus}
                    >
                      {STATUS_LIST.map(st =>
                        <MenuItem key={st} eventKey={st}>{st}</MenuItem>
                      )}
                    </DropdownButton>
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>Start:</ControlLabel></th>
                  <td>
                    <DateTime
                        className="milestone-start"
                        timeFormat={false}
                        closeOnSelect={true}
                        value={this.start}
                        onChange={this.onChangeStart}
                    />
                  </td>
                </tr>
                <tr>
                  <th className="header"><ControlLabel>End:</ControlLabel></th>
                  <td>
                    <DateTime
                        className="milestone-end"
                        timeFormat={false}
                        closeOnSelect={true}
                        value={this.end}
                        onChange={this.onChangeEnd}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancel</Button>
          <Button
              onClick={this.onAddMilestone}
              disabled={!this.name || this.busy}
              bsStyle="primary"
          >
            {milestone ? 'Save' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>);
  }

  @action.bound
  private onChangeName(e: React.FormEvent<HTMLInputElement & FormControl>) {
    this.name = e.currentTarget.value;
  }

  @action.bound
  private onChangeDescription(e: React.FormEvent<HTMLInputElement & FormControl>) {
    this.description = e.currentTarget.value;
  }

  @bind
  private onSelectStatus(st: any) {
    this.status = st;
  }

  @action.bound
  private onChangeStart(date: any) {
    this.start = date.toDate();
  }

  @action.bound
  private onChangeEnd(date: any) {
    this.end = date.toDate();
  }

  @bind
  private onAddMilestone() {
    const { project, milestone, onHide } = this.props;
    this.busy = true;
    const milestoneInput = {
      name: this.name,
      description: this.description,
      status: this.status,
      startDate: this.start,
      endDate: this.end,
    };
    if (milestone) {
      return updateMilestone(milestone.id, milestoneInput).then(result => {
        this.busy = false;
        onHide();
      }, displayErrorToast);
    } else {
      return createMilestone(project.account, project.uname, milestoneInput).then(result => {
        this.busy = false;
        onHide();
      }, displayErrorToast);
    }
  }
}
