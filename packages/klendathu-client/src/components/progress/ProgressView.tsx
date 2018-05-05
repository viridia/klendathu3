import * as React from 'react';
import * as classNames from 'classnames';
import * as qs from 'qs';
import { IssueListQuery, ObservableProjectPrefs, Project, IssueGroup } from '../../models';
import { Issue } from 'klendathu-json-types';
import { FilterParams } from '../filters/FilterParams';
import { GroupHeader } from '../issues/GroupHeader';
import { IssueCard } from '../issues/IssueCard';
import { RouteComponentProps } from 'react-router-dom';
import { action, observable } from 'mobx';
import { updateIssue } from '../../network/requests';
import { observer } from 'mobx-react';

import './ProgressView.scss';

interface Props extends RouteComponentProps<{}> {
  issues: IssueListQuery;
  project: Project;
  prefs: ObservableProjectPrefs;
}

@observer
export class ProgressView extends React.Component<Props> {
  @observable private dragState: string = null;
  @observable private dragGroup: string = undefined;

  public componentWillMount() {
    const { location, issues, project } = this.props;
    issues.setFromQuery(project, qs.parse(location.search, { ignoreQueryPrefix: true }));
  }

  public componentWillReceiveProps(nextProps: Props) {
    const { location, issues, project } = nextProps;
    issues.setFromQuery(project, qs.parse(location.search, { ignoreQueryPrefix: true }));
  }

  public render() {
    return (
      <section className="kdt content progress-view">
        <FilterParams {...this.props} />
        <section className="progress-table-view">
          <table className="progress-table">
            {this.renderGroups()}
          </table>
        </section>
      </section>
    );
  }

  public renderGroups() {
    const { issues } = this.props;
    const allIssuesByState = this.groupByState(issues.asList);
    if (issues.group) {
      return issues.grouped.map(gr => {
        return this.renderIssues(gr.issues, allIssuesByState, gr);
      });
    } else {
      return this.renderIssues(issues.sorted, allIssuesByState, null);
    }
  }

  public renderIssues(
      issues: Issue[],
      allIssuesByState: Map<string, Issue[]>,
      group?: IssueGroup) {
    const { project } = this.props;
    const issuesByState = this.groupByState(issues);
    const result: JSX.Element[] = [];
    const groupId = group && group.value || '';
    if (group) {
      result.push(
        <thead className="group-header" key={`${group.sortKey}-group-header`}>
          <tr>
            <th colSpan={project.template.states.length}>
              <GroupHeader group={group} project={project} />
            </th>
          </tr>
        </thead>
      );
    }
    result.push(
      <thead className="state-header" key={`${group ? group.sortKey : 'progress'}-state-header`}>
        <tr>
          {project.template.states.map(st => (
            <th
                className={classNames({
                  collapsed: !allIssuesByState.has(st.id),
                  dragOver: st.id === this.dragState && groupId === this.dragGroup,
                })}
                key={st.id}
            >
              {allIssuesByState.has(st.id) && st.caption}
            </th>
          ))}
        </tr>
      </thead>
    );
    result.push(
      <tbody key={`${group ? group.sortKey : 'progress'}-body`}>
        <tr>
          {project.template.states.map(st => {
            const ilist = issuesByState.get(st.id);
            const alist = allIssuesByState.has(st.id);
            return (
              <td
                  className={classNames({
                    collapsed: !alist,
                    dragOver: st.id === this.dragState && groupId === this.dragGroup,
                  })}
                  data-state={st.id}
                  data-group={groupId}
                  key={st.id}
                  onDragOver={this.onDragOver}
                  onDragLeave={this.onDragLeave}
                  onDrop={this.onDrop}
              >
                {!alist
                  ? <div className="progress-column-label">{st.caption}</div>
                  : ilist && ilist.map(i =>
                      <IssueCard {...this.props} key={i.id} issue={i} group={groupId} />)}
              </td>
            );
          })}
        </tr>
      </tbody>
    );
    return result;
  }

  private groupByState(issues: Issue[]): Map<string, Issue[]> {
    const issuesByState = new Map<string, Issue[]>();
    for (const issue of issues) {
      const issueList = issuesByState.get(issue.state);
      if (issueList) {
        issueList.push(issue);
      } else {
        issuesByState.set(issue.state, [issue]);
      }
    }
    return issuesByState;
  }

  @action.bound
  private onDragOver(e: React.DragEvent<any>) {
    const { issues } = this.props;
    e.preventDefault();
    this.dragState = null;
    this.dragGroup = null;
    for (const type of e.dataTransfer.types) {
      if (type.startsWith('issue/')) {
        const [, account, project, index, fromGroup] = type.split('/', 5);
        const issue = issues.get(`${account}/${project}/${index}`);
        if (issue) {
          const state = e.currentTarget.dataset.state;
          const group = e.currentTarget.dataset.group;
          if (state !== issue.state && fromGroup === group) {
            this.dragState = state;
            this.dragGroup = group;
          }
        }
        break;
      }
    }
  }

  @action.bound
  private onDragLeave(e: React.DragEvent<any>) {
    e.preventDefault();
    this.dragState = null;
    this.dragGroup = null;
  }

  @action.bound
  private onDrop(e: React.DragEvent<any>) {
    const { issues } = this.props;
    e.preventDefault();
    if (this.dragState) {
      for (const type of e.dataTransfer.types) {
        if (type.startsWith('issue/')) {
          const [, account, project, index] = type.split('/', 4);
          const issue = issues.get(`${account}/${project}/${index}`);
          updateIssue(issue.id, { state: this.dragState });
          break;
        }
      }
    }
    this.dragState = null;
    this.dragGroup = null;
  }
}
