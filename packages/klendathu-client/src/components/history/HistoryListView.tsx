import * as React from 'react';
import { ObservableChanges, Project } from '../../models';
import { Account, Change } from 'klendathu-json-types';
import { HistoryListEntry } from './HistoryListEntry';
import { RouteComponentProps } from 'react-router-dom';
import { computed } from 'mobx';
import { observer } from 'mobx-react';

import './HistoryListView.scss';

interface Props extends RouteComponentProps<{}> {
  account: Account;
  project: Project;
}

type ChangeListItem = [Date, string, Change];

function compareEntries(a: ChangeListItem, b: ChangeListItem) {
  if (a[0] < b[0]) { return -1; }
  if (a[0] > b[0]) { return 1; }
  return 0;
}

@observer
export class HistoryListView extends React.Component<Props> {
  private changes: ObservableChanges;

  public componentWillMount() {
    const { project } = this.props;
    this.changes = new ObservableChanges(`${project.account}/${project.uname}`);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.project !== this.props.project) {
      const { project } = nextProps;
      this.changes.release();
      this.changes = new ObservableChanges(`${project.account}/${project.uname}`);
    }
  }

  public componentWillUnmount() {
    this.changes.release();
  }

  public render() {
    const { project } = this.props;
    // if (error) {
    //   return <ErrorDisplay error={error} />;
    // }
    if (!project.template.loaded) {
      return null;
    }
    return (
      <section className="kdt content history-list">
        <header>
          <span className="title">Recent Changes</span>
        </header>
        {this.renderChanges()}
      </section>
    );
  }

  private renderChanges() {
    if (this.changes.length === 0) {
      return (
        <div className="card internal">
          {this.changes.loaded && <div className="no-changes">No changes found</div>}
        </div>
      );
    }
    return (
      <div className="card internal">
        {this.grouped.map(group =>
          <HistoryListEntry
              key={`${group[0].id}/${group[0].at.toString()}`}
              {...this.props}
              issueId={group[0].issue}
              changeGroup={group}
          />
        )}
      </div>
    );
  }

  @computed get grouped(): Change[][] {
    const sorted = [
      ...this.changes.changes.map(ch => [ch.at, ch.issue, ch] as ChangeListItem),
    ];
    sorted.sort(compareEntries).reverse();
    let prevIssue: string = null;
    const groups: Change[][] = [];
    for (const [, , ch] of sorted) {
      if (ch.issue === prevIssue) {
        groups[groups.length - 1].push(ch);
      } else {
        prevIssue = ch.issue;
        groups.push([ch]);
      }
    }
    return groups;
  }
}
