import { Account, Role } from 'klendathu-json-types';
import { Project } from '../../../../models';
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

interface Props {
  account: Account;
  project: Project;
}

@observer
export class ProjectMilestonesEdit extends React.Component<Props> {
  @observable private showAddMilestone = false;

  public render() {
    const { project } = this.props;
    return (
      <section className="settings-tab-pane">
        <header>
          <div className="title">Project milestones for: {project.title}</div>
        </header>
        <section className="milestone-list">
          List
        </section>
        <footer>
          {project.role >= Role.DEVELOPER &&
            <Button onClick={this.onShowAddMilestone}>New</Button>}
        </footer>
      </section>
    );
  }

  @action.bound
  private onShowAddMilestone(e: any) {
    this.showAddMilestone = true;
    console.log(this.showAddMilestone);
  }
}
