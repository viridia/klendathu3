import * as React from 'react';
import { observer } from 'mobx-react';
import { ProjectListQuery } from '../../models/ProjectListQuery';
import { Memberships } from '../../models/Memberships';
import { ProjectCard } from './ProjectCard';

import './ProjectList.scss';

interface Props {
  memberships: Memberships;
}

@observer
export class ProjectList extends React.Component<Props> {
  private projectList: ProjectListQuery;

  constructor(props: undefined) {
    super(props);
    this.projectList = new ProjectListQuery();
  }

  public componentWillUnmount() {
    this.projectList.release();
  }

  public render() {
    const projects = this.projectList.asList;
    if (projects.length === 0) {
      return (
        <section className="project-list empty">
          <section className="card internal no-projects">
            You are not yet a member of any projects.
          </section>
        </section>
      );
    }
    return (
      <section className="project-list">
        {projects.map(project =>
          <ProjectCard key={project.id} project={project} memberships={this.props.memberships} />)}
      </section>
    );
  }
}
