import * as React from 'react';
import { observer } from 'mobx-react';
import { NavLink, Route, Switch } from 'react-router-dom';
import { ProjectNavLinks } from './ProjectNavLinks';

import './LeftNav.scss';

import AppsIcon from '../../../icons/ic_apps.svg';

@observer
export class LeftNav extends React.Component<undefined> {
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
      </nav>
    );
  }
}
