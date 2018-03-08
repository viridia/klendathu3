import * as React from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { LabelListQuery, ObservableProjectPrefs } from '../../models';
import { Account, Label } from 'klendathu-json-types';
import { LabelLink } from './LabelLink';

import './LeftNav.scss';

interface Props {
  account: Account;
  project: string;
}

@observer
export class LabelLinks extends React.Component<Props> {
  private query: LabelListQuery;
  private prefs: ObservableProjectPrefs;

  public componentWillMount() {
    const { account, project } = this.props;
    this.query = new LabelListQuery(account.uid, project);
    this.prefs = new ObservableProjectPrefs(account.uid, project);
  }

  public componentWillUnmount() {
    this.query.release();
    this.prefs.release();
  }

  public render() {
    const { account, project } = this.props;
    if (this.query.length === 0) {
      return null;
    }
    const visibleLabels = this.visibleLabels;
    const labelFilter = (label: Label) => visibleLabels.has(label.id);
    return (
      <ul>
        {this.query.asList.filter(labelFilter).map(label => (
          <LabelLink key={label.id} account={account.uname} project={project} label={label} />
        ))}
      </ul>
    );
  }

  @computed
  private get visibleLabels(): Map<string, boolean> {
    return new Map(this.prefs.labels.map(label => [label, true] as [string, boolean]));
  }
}
