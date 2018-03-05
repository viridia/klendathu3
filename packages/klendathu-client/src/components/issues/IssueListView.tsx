import * as React from 'react';
import { Issue as IssueData, Role } from 'klendathu-json-types';
import { IssueListQuery, Project } from '../../models';
import { ProjectPrefsQuery } from '../../models/ProjectPrefsQuery';
import { ColumnSort } from '../common/ColumnSort';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import {
  ColumnRenderer,
  CustomColumnRenderer,
  DateColumnRenderer,
  TextColumnRenderer,
  TypeColumnRenderer,
  UserColumnRenderer,
} from './columns';

import { Checkbox } from 'react-bootstrap';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import bind from 'bind-decorator';
import * as classNames from 'classnames';
import * as qs from 'qs';

import './IssueListView.scss';

interface Props extends RouteComponentProps<{}> {
  project: Project;
  prefs: ProjectPrefsQuery;
  issues: IssueListQuery;
}

interface QueryParams { [param: string]: string; }

@observer
export class IssueListView extends React.Component<Props> {
  private queryParams: QueryParams = {};
  private selectAllEl: HTMLInputElement;
  @observable private selection = new Map<number, boolean>();

  public componentWillMount() {
    const { location } = this.props;
    this.queryParams = qs.parse(location.search.slice(1));
    this.updateQuery();
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.queryParams = qs.parse(location.search.slice(1));
    this.updateQuery();
  }

  public render() {
    const { issues } = this.props;
    if (issues.loading) {
      return (
        <section className="kdt content issue-list">
          <div className="card issue">
            <div className="no-issues">Loading&hellip;</div>
          </div>
        </section>
      );
    } else if (issues.size === 0) {
      return (
        <section className="kdt content issue-list">
          <div className="card issue">
            <div className="no-issues">No issues found</div>
          </div>
        </section>
      );
    } else {
      return (
        <section className="kdt content issue-list">
          <div className="card issue">
            <table className="issue">
              {this.renderHeader()}
              <tbody>
                {this.renderRows()}
              </tbody>
            </table>
          </div>
        </section>
      );
    }
  }

  private renderHeader() {
    const { project, prefs } = this.props;
    const { sort, descending } = this.sortOrder();
    return (
      <thead>
        <tr>
          {project.role >= Role.UPDATER && (<th className="selected">
            <label htmlFor="all-issues">
              <Checkbox
                  id="all-issues"
                  bsClass="cbox"
                  checked={this.selection.size > 0}
                  inputRef={el => { this.selectAllEl = el; }}
                  onChange={this.onChangeSelectAll}
              />
            </label>
          </th>)}
          <th className="id">
            <ColumnSort
                column="id"
                sortKey={sort}
                descending={descending}
                onChangeSort={this.onChangeSort}
            >
              #
            </ColumnSort>
          </th>
          {prefs.columns.map(cname => {
            const cr = this.columnRenderers.get(cname);
            if (cr) {
              return cr.renderHeader(sort, descending, this.onChangeSort);
            }
            return <th className="custom center" key={cname}>--</th>;
          })}
          <th className="summary">
            <section>
              <ColumnSort
                  column="summary"
                  sortKey={sort}
                  descending={descending}
                  onChangeSort={this.onChangeSort}
              >
                Summary
              </ColumnSort>
            </section>
          </th>
        </tr>
      </thead>
    );
  }

  private renderRows(): JSX.Element[] {
    return this.props.issues.sorted.map(i => this.renderIssue(i));
  }

  private renderIssue(issue: IssueData, level: number = 0): JSX.Element {
    const { project, prefs } = this.props;
    const linkTarget = {
      pathname: `/${project.owner}/${project.id}/issues/${issue.id}`,
      state: {
        back: this.props.location,
        // idList: this.issueIds,
      },
    };
    const issueId = `issue-${issue.id}`;
    const style: any = {};
    if (level > 0) {
      style.marginLeft = `${level * 32}px`;
    }
    return (
      <tr key={issue.id}>
        {project.role >= Role.UPDATER && (<td className="selected">
          <label htmlFor={issueId}>
            <Checkbox
                id={issueId}
                bsClass="cbox"
                data-id={issue.id}
                checked={this.selection.has(issue.id)}
                onChange={this.onChangeSelection}
            />
          </label>
        </td>)}
        <td className="id">
          <NavLink to={linkTarget}>{issue.id}</NavLink>
        </td>
        {prefs.columns.map(cname => {
          const cr = this.columnRenderers.get(cname);
          if (cr) {
            return cr.render(issue);
          }
          return <td className="custom" key={cname} />;
        })}
        <td className="title">
          <NavLink to={linkTarget} className={classNames({ child: level > 0 })} style={style}>
            <span className="summary">{issue.summary}</span>
          </NavLink>
        </td>
      </tr>
    );
    // TODO:
    // {issue.labels
    //   .filter(l => labels.has(l))
    //   .map(l => <LabelName project={project.id} label={l} key={l} />)}
  }

  @bind
  private onChangeSort(column: string, descending: boolean) {
    const { history } = this.props;
    const sort = `${descending ? '-' : ''}${column}`;
    history.replace({
      ...this.props.location,
      search: `?${qs.stringify({ ...this.queryParams, sort })}`,
    });
  }

  @action.bound
  private onChangeSelection(e: any) {
    const id = parseInt(e.target.dataset.id, 10);
    if (e.target.checked) {
      this.selection.set(id, true);
    } else {
      this.selection.delete(id);
    }
  }

  @action.bound
  private onChangeSelectAll(e: any) {
    if (e.target.checked) {
      // this.iss
      // this.props.selectIssues(this.issueIds);
    } else {
      this.selection.clear();
    }
  }

  @computed
  private get columnRenderers(): Map<string, ColumnRenderer> {
    const { project } = this.props;
    const columnRenderers = new Map<string, ColumnRenderer>();
    columnRenderers.set('state', new TextColumnRenderer('State', 'state', 'state pad'));
    columnRenderers.set('reporter',
        new UserColumnRenderer('Reporter', 'reporterName', 'reporter pad'));
    columnRenderers.set('owner', new UserColumnRenderer('Owner', 'ownerName', 'owner pad'));
    columnRenderers.set('created', new DateColumnRenderer('Created', 'created', 'created pad'));
    columnRenderers.set('updated', new DateColumnRenderer('Updated', 'updated', 'updated pad'));
    const template = project.templateId;
    if (template && template.value) {
      columnRenderers.set('type', new TypeColumnRenderer(template.value));
      for (const type of template.value.types) {
        if (type.fields) {
          for (const field of type.fields) {
            columnRenderers.set(`custom.${field.id}`, new CustomColumnRenderer(field));
          }
        }
      }
    }
    return columnRenderers;
  }

  private sortOrder(): { sort: string, descending: boolean } {
    if (this.queryParams.sort) {
      if (this.queryParams.sort.startsWith('-')) {
        return { sort: this.queryParams.sort.slice(1), descending: true };
      }
      return { sort: this.queryParams.sort, descending: false };
    }
    return { sort: 'id', descending: true };
  }

  @action
  private updateQuery() {
    const { issues } = this.props;
    const { sort, descending } = this.sortOrder();
    issues.sort = sort;
    issues.descending = descending;
  }
}
