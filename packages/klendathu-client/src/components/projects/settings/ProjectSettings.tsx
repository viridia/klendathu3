import bind from 'bind-decorator';
import { Account, Role } from 'klendathu-json-types';
import { Project, ObservableProjectPrefs } from '../../../models';
import * as React from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { ColumnSettings } from './columns/ColumnSettings';
import { ProjectMemberList } from './members/ProjectMemberList';
import { ProjectInfoEdit } from './ProjectInfoEdit';
// import { ProjectTemplateEdit } from './ProjectTemplateEdit';
import { WorkflowEdit } from './workflow/WorkflowEdit';

import './settings.scss';

interface Props extends RouteComponentProps<{ tab?: string }> {
  account: Account;
  project: Project;
  prefs: ObservableProjectPrefs;
}

// TODO: finish
export class ProjectSettings extends React.Component<Props> {
  public render() {
    const { project, match } = this.props;
    if (!project) {
      return <section className="kdt content project-settings" />;
    }
    const activeKey = match.params.tab || 'info';
    return (
      <section className="kdt content project-settings">
        <header>Project settings</header>
        <Tabs
            activeKey={activeKey}
            onSelect={this.handleSelect}
            className="project-panel"
            animation={false}
            id="project-panel"
        >
          <Tab eventKey="info" title="Project Info">
            <ProjectInfoEdit {...this.props} />
          </Tab>
          <Tab eventKey="columns" title="Columns">
            <ColumnSettings {...this.props} />
          </Tab>
          <Tab eventKey="members" title="Members">
            <ProjectMemberList {...this.props} />
          </Tab>
          {project.role >= Role.MANAGER && (<Tab eventKey="templates" title="Issue Templates">
            {/*<ProjectTemplateEdit {...this.props} />*/}
          </Tab>)}
          {project.role >= Role.MANAGER && (<Tab eventKey="workflow" title="Workflow">
            <WorkflowEdit {...this.props} />
          </Tab>)}
        </Tabs>
      </section>
    );
  }

  @bind
  private handleSelect(selected: any) {
    const { account, project } = this.props;
    this.props.history.push({
      pathname: `/${account.uname}/${project.uname}/settings/${selected}`,
    });
  }
}
