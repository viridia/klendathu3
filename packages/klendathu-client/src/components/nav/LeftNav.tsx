import * as React from 'react';
import { observer } from 'mobx-react';
import { NavLink, Route, Switch, RouteComponentProps } from 'react-router-dom';
import { ProjectNavLinks } from './ProjectNavLinks';
import { ProjectLink } from './ProjectLink';
import { ProjectListQuery } from '../../models';

import './LeftNav.scss';

import AppsIcon from '../../../icons/ic_apps.svg';

@observer
export class LeftNav extends React.Component<RouteComponentProps<{}>> {
  private projectList: ProjectListQuery;

  constructor(props: undefined) {
    super(props);
    this.projectList = new ProjectListQuery();
  }

  public componentWillUnmount() {
    this.projectList.release();
  }

  public render() {
    return (
      <nav className="kdt left-nav">
        <Switch>
          <Route path="/settings" />
          <Route path="/:account/:project" component={ProjectNavLinks} />
        </Switch>
        <NavLink to={{ pathname: '/projects' }}>
          <AppsIcon /> Projects
        </NavLink>
        <ul>
          {this.projectList.asList.map(project => (
            <ProjectLink {...this.props} key={project.id} project={project} />
          ))}
        </ul>
      </nav>
    );
  }
}
