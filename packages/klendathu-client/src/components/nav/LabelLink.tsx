import * as React from 'react';
// import { observer } from 'mobx-react';
import { LabelName } from '../common/LabelName';
import { Account, Label } from 'klendathu-json-types';
import { QueryLink } from './QueryLink';

import './LeftNav.scss';

interface Props {
  account: Account;
  project: string;
  label: Label;
}

// @observer
export class LabelLink extends React.Component<Props> {
  public render() {
    const { account, project, label } = this.props;
    return (
      <li className="label-item" key={label.id}>
        <QueryLink
            to={`/${account.uname}/${project}/issues`}
            query={{ label: label.id.split('/', 3)[2] }}
        >
          <LabelName label={label.id} />
        </QueryLink>
      </li>
    );
  }
}
