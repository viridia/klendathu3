import * as React from 'react';
import { observer } from 'mobx-react';
import { NavLink } from 'react-router-dom';
import { Project } from 'klendathu-json-types';
import { accounts, ObservableAccount } from '../../models';

import './LeftNav.scss';

interface Props {
  project: Project;
}

@observer
export class ProjectLink extends React.Component<Props> {
  private account: ObservableAccount;

  public componentWillMount() {
    const { project } = this.props;
    const owner = project.id.split('/', 1)[0];
    this.account = accounts.byId(owner);
  }

  public componentWillUnmount() {
    this.account.release();
  }

  public render() {
    const { project } = this.props;
    const [, uname] = project.id.split('/', 2);
    return (
      <li className="project-item" key={project.id}>
        <NavLink to={{ pathname: `/${this.account.uname}/${uname}` }}>
        {project.title}
        </NavLink>
      </li>
    );
  }
}
