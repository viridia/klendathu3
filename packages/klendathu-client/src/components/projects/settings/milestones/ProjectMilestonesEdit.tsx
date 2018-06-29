import * as React from 'react';
import * as dateFormat from 'dateformat';
import * as classNames from 'classnames';
import { Account, Role, Milestone, MilestoneStatus } from 'klendathu-json-types';
import { MilestoneListQuery, Project } from '../../../../models';
import { EditMilestoneDialog } from './EditMilestoneDialog';
import { Button, ProgressBar } from 'react-bootstrap';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { RemoveMilestoneDialog } from './RemoveMilestoneDialog';

import './ProjectMilestonesEdit.scss';

interface Props {
  account: Account;
  project: Project;
  milestones: MilestoneListQuery;
}

@observer
export class ProjectMilestonesEdit extends React.Component<Props> {
  @observable private showAddMilestone = false;
  @observable private showDeleteMilestone = false;

  private milestone: Milestone = null;

  public render() {
    const { project, milestones } = this.props;
    return (
      <section className="settings-tab-pane">
        {this.showAddMilestone &&
          <EditMilestoneDialog
              project={project}
              milestone={this.milestone}
              onHide={this.onHideAddMilestone}
          />}
        {this.showDeleteMilestone &&
          <RemoveMilestoneDialog
              project={project}
              milestone={this.milestone}
              onHide={this.onHideDeleteMilestone}
          />}
        <header>
          <div className="title">Project milestones</div>
          {project.role >= Role.MANAGER &&
            <Button onClick={this.onShowAddMilestone}>New</Button>}
        </header>
        <section className="card internal">
          {milestones.length === 0
            ? <div className="empty-list">No milestones defined for this project.</div>
            : <table className="fullwidth project-milestone-list">
                <thead>
                  <tr className="heading">
                    <th className="name left pad">Name</th>
                    <th className="status center pad">Status</th>
                    <th className="start center pad">Start</th>
                    <th className="end center pad">End</th>
                    <th className="completion center pad">Progress</th>
                    <th className="actions right pad">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.asList.map(m => this.renderMilestone(m))}
                </tbody>
              </table>}
        </section>
      </section>
    );
  }

  private renderMilestone(milestone: Milestone) {
    return (
      <tr key={milestone.id}>
        <td className="name left pad">
          <b>{milestone.name}</b>
          {milestone.description && ' - '}
          {milestone.description}
        </td>
        <td className={classNames('status center pad', milestone.status)}>
          <div className="mstatus">{milestone.status}</div>
        </td>
        <td className="start center pad">
          {milestone.status !== MilestoneStatus.STATIC && milestone.startDate &&
              dateFormat(milestone.startDate, 'isoDate')}
        </td>
        <td className="end center pad">
          {milestone.status !== MilestoneStatus.STATIC && milestone.endDate &&
              dateFormat(milestone.endDate, 'isoDate')}
        </td>
        <td className="completion center pad">
          {milestone.status !== MilestoneStatus.STATIC &&
            <ProgressBar now={50} max={100} />
          }</td>
        <td className="actions right pad">
          <Button
            onClick={(e: any) => {
              this.milestone = milestone;
              this.showAddMilestone = true;
            }}
          >
            Edit
          </Button>
          <Button
            onClick={(e: any) => {
              this.milestone = milestone;
              this.showDeleteMilestone = true;
            }}
          >
            Delete
          </Button>
        </td>
      </tr>
    );
  }

  @action.bound
  private onShowAddMilestone(e: any) {
    this.milestone = null;
    this.showAddMilestone = true;
  }

  @action.bound
  private onHideAddMilestone() {
    this.showAddMilestone = false;
  }

  @action.bound
  private onHideDeleteMilestone() {
    this.showDeleteMilestone = false;
  }
}
