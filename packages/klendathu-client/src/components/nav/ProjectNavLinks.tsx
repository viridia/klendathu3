import * as React from 'react';
import { observer } from 'mobx-react';
import { QueryLink } from './QueryLink';
import { LabelLinks } from './LabelLinks';
// import { ProjectQuery } from '../../models/ProjectQuery';
import { NavLink, RouteComponentProps } from 'react-router-dom';

import './LeftNav.scss';

import LabelIcon from '../../../icons/ic_label.svg';
import ListIcon from '../../../icons/ic_list.svg';
import PersonIcon from '../../../icons/ic_person.svg';
import SettingsIcon from '../../../icons/ic_settings.svg';

type Props = RouteComponentProps<{ owner: string, project: string }>;

@observer
export class ProjectNavLinks extends React.Component<Props> {
  private projectRef: any;

  public componentWillMount() {
    // const { account, project } = this.props.match.params;
    // this.projectRef = new ProjectQuery(owner, project);
  }

  public componentWillUnmount() {
    // this.projectRef.release();
  }

  public render() {
    if (!this.projectRef || !this.projectRef.value) {
      return null;
    }
    const { owner, project } = this.props.match.params;
    return (
      <>
        <QueryLink
            to={`/${owner}/${project}/issues`}
            query={{ owner: undefined, label: undefined, type: undefined, state: undefined }}
        >
          <ListIcon /> All Issues
        </QueryLink>
        <QueryLink to={`/${owner}/${project}/issues`} query={{ owner: 'me', state: 'open' }}>
          <PersonIcon /> My Issues
        </QueryLink>
        <NavLink to={{ pathname: `/${owner}/${project}/labels` }}>
          <LabelIcon /> Labels
        </NavLink>
        {/*<LabelLinks project={this.projectRef} />*/}
        <NavLink to={{ pathname: `/${owner}/${project}/settings` }}>
          <SettingsIcon /> Settings
        </NavLink>
      </>
    );
  }
}
