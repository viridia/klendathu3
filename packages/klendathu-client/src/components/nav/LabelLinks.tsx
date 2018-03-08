import * as React from 'react';
import { observer } from 'mobx-react';
import { LabelListQuery } from '../../models';
import { Account } from 'klendathu-json-types';
import { LabelLink } from './LabelLink';

import './LeftNav.scss';

interface Props {
  account: Account;
  project: string;
}

@observer
export class LabelLinks extends React.Component<Props> {
  private query: LabelListQuery;

  public componentWillMount() {
    const { account, project } = this.props;
    this.query = new LabelListQuery(account.uid, project);
  }

  public componentWillUnmount() {
    this.query.release();
  }

  public render() {
    const { account, project } = this.props;
    if (this.query.length === 0) {
      return null;
    }
    return (
      <ul>
        {this.query.asList.map(label => (
          <LabelLink key={label.id} account={account.uname} project={project} label={label} />
        ))}
      </ul>
    );
  }
}
