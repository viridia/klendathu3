import * as React from 'react';
import { observer } from 'mobx-react';
import { QueryLink } from './QueryLink';
import { AccountProvider } from '../common/AccountProvider';
import { LabelLinks } from './LabelLinks';
import { NavLink, RouteComponentProps } from 'react-router-dom';

import './LeftNav.scss';

import LabelIcon from '../../../icons/ic_label.svg';
import ListIcon from '../../../icons/ic_list.svg';
import PersonIcon from '../../../icons/ic_person.svg';
import BookmarkIcon from '../../../icons/ic_bookmark.svg';
import SettingsIcon from '../../../icons/ic_settings.svg';
import DependenciesIcon from '../../../icons/ic_gantt.svg';
import ProgressIcon from '../../../icons/ic_progress.svg';
import HistoryIcon from '../../../icons/ic_history.svg';

type Props = RouteComponentProps<{ account: string, project: string }>;

@observer
export class ProjectNavLinks extends React.Component<Props> {
  public render() {
    const { account, project } = this.props.match.params;
    return (
      <>
        <QueryLink
            to={`/${account}/${project}/issues`}
            query={{ owner: undefined, label: undefined, type: undefined, state: undefined }}
        >
          <ListIcon /> All Issues
        </QueryLink>
        <QueryLink to={`/${account}/${project}/issues`} query={{ owner: 'me', state: 'open' }}>
          <PersonIcon /> My Issues
        </QueryLink>
        <NavLink to={{ pathname: `/${account}/${project}/labels` }}>
          <LabelIcon /> Labels
        </NavLink>
        <AccountProvider account={account}>
          {acc => <>
            <LabelLinks {...this.props} account={acc} project={project} />
            <NavLink to={{ pathname: `/${account}/${project}/filters` }}>
              <BookmarkIcon /> Saved Filters
            </NavLink>
          </>}
        </AccountProvider>
        <NavLink to={{ pathname: `/${account}/${project}/progress` }}>
          <ProgressIcon /> Progress
        </NavLink>
        <NavLink to={{ pathname: `/${account}/${project}/dependencies` }}>
          <DependenciesIcon /> Dependencies
        </NavLink>
        <NavLink to={{ pathname: `/${account}/${project}/history` }}>
          <HistoryIcon /> Changes
        </NavLink>
        <NavLink to={{ pathname: `/${account}/${project}/settings` }}>
          <SettingsIcon /> Settings
        </NavLink>
      </>
    );
  }
}
