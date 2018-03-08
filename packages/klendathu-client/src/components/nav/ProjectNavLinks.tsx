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
import SettingsIcon from '../../../icons/ic_settings.svg';

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
          {acc => <LabelLinks {...this.props} account={acc} project={project} />}
        </AccountProvider>
        <NavLink to={{ pathname: `/${account}/${project}/settings` }}>
          <SettingsIcon /> Settings
        </NavLink>
      </>
    );
  }
}
