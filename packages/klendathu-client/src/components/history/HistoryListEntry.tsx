import * as React from 'react';
import { issues, ObservableIssue, Project } from '../../models';
import { Account, Change } from 'klendathu-json-types';
import { ChangeEntry } from './ChangeEntry';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { observer } from 'mobx-react';

interface Props extends RouteComponentProps<{}> {
  account: Account;
  project: Project;
  issueId: string;
  changeGroup: Change[];
}

@observer
export class HistoryListEntry extends React.Component<Props> {
  private issue: ObservableIssue;

  public componentWillMount() {
    const { issueId } = this.props;
    this.issue = issues.get(issueId);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.issueId !== this.issue.id) {
      const issue = issues.get(nextProps.issueId);
      this.issue.release();
      this.issue = issue;
    }
  }

  public componentWillUnmount() {
    this.issue.release();
  }

  public render() {
    const { account, project, changeGroup } = this.props;
    const linkTarget = {
      pathname: `/${account.uname}/${project.uname}/${this.issue.index}`,
      state: { back: this.props.location },
    };
    return (
      <section className="history-list-entry">
        <header className="issue-header">
          <NavLink to={linkTarget}>
            <span className="id">#{this.issue.index}: </span>
            <span className="summary">{this.issue.summary}</span>
          </NavLink>
        </header>
        {changeGroup.map(change => (
            <ChangeEntry
                key={change.id}
                change={change}
                project={project}
                account={account}
            />
        ))}
      </section>
    );
  }
}
