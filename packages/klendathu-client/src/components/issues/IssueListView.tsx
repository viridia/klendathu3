import * as React from 'react';
import { Account, Issue, Role } from 'klendathu-json-types';
import {
  IssueListQuery,
  ObservableProjectPrefs,
  ObservableSet,
  OperandType,
  Project,
  session,
} from '../../models';
import { ColumnSort } from '../common/ColumnSort';
import { RouteComponentProps } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { IssueListEntry } from './IssueListEntry';
import { MassEdit } from '../massedit/MassEdit';
import { FilterParams } from '../filters/FilterParams';
import {
  ColumnRenderer,
  CustomColumnRenderer,
  DateColumnRenderer,
  StateColumnRenderer,
  TypeColumnRenderer,
  UserColumnRenderer,
} from './columns';
import { descriptors } from '../filters/FilterTermDescriptor';
import { Checkbox, Dropdown, MenuItem } from 'react-bootstrap';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import bind from 'bind-decorator';
import * as qs from 'qs';

import MenuIcon from '../../../icons/ic_menu.svg';

import './IssueListView.scss';

interface Props extends RouteComponentProps<{}> {
  account: Account;
  project: Project;
  prefs: ObservableProjectPrefs;
  issues: IssueListQuery;
}

interface QueryParams { [param: string]: string; }

@observer
export class IssueListView extends React.Component<Props> {
  private queryParams: QueryParams = {};
  private selectAllEl: HTMLInputElement;
  @observable private selection = new ObservableSet();

  public componentWillMount() {
    const { location } = this.props;
    this.queryParams = qs.parse(location.search.slice(1));
    this.updateQuery();
    this.updateSelectAll();
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.queryParams = qs.parse(location.search, { ignoreQueryPrefix: true });
    this.updateQuery();
  }

  public componentDidUpdate() {
    this.updateSelectAll();
  }

  public render() {
    const { account, issues, project } = this.props;
    if (!account) {
      return null;
    }
    if (!issues.loaded || !project.template.loaded) {
      return (
        <section className="kdt content issue-list">
          <div className="card issue">
            <div className="no-issues">Loading&hellip;</div>
          </div>
        </section>
      );
    } else if (issues.length === 0) {
      return (
        <section className="kdt content issue-list">
          <FilterParams {...this.props} />
          <div className="card issue">
            <div className="no-issues">No issues found</div>
          </div>
        </section>
      );
    } else {
      return (
        <section className="kdt content issue-list">
          <FilterParams {...this.props} />
          <MassEdit project={project} selection={this.selection} />
          {this.renderIssues()}
        </section>
      );
    }
  }

  private renderIssues() {
    const { issues } = this.props;
    if (issues.group) {
      const column = this.columnRenderers.get(issues.group);
      if (column && column.renderGroupHeader) {
        return issues.grouped.map(gr => (
          <section className="issue-group" key={gr.groupValue}>
            {column.renderGroupHeader(gr.groupValue)}
            {this.renderIssueTable(gr.issues)}
          </section>
        ));
      }
    }
    return this.renderIssueTable(issues.sorted);
  }

  private renderIssueTable(issues: Issue[]) {
    return (
      <div className="card issue">
        <table className="issue">
          {this.renderHeader()}
          <tbody>
            {issues.map(issue => (
              <IssueListEntry
                  {...this.props}
                  key={issue.id}
                  issue={issue}
                  columnRenderers={this.columnRenderers}
                  selection={this.selection}
              />))}
          </tbody>
        </table>
      </div>
    );
  }

  private renderHeader() {
    const { account, project } = this.props;
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
                className="sort"
                sortKey={sort}
                descending={descending}
                onChangeSort={this.onChangeSort}
            >
              #
            </ColumnSort>
          </th>
          {this.columns.map(cname => {
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
                  className="sort"
                  sortKey={sort}
                  descending={descending}
                  onChangeSort={this.onChangeSort}
              >
                Summary
              </ColumnSort>
              <Dropdown id="issue-menu" pullRight={true}>
                <Dropdown.Toggle noCaret={true}>
                  <MenuIcon />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {/*<MenuItem
                      className={classNames({ checked: query.subtasks !== undefined })}
                      onClick={this.onToggleSubtasks}>Show Subtasks</MenuItem>*/}

                  <LinkContainer to={`/${account.uname}/${project.uname}/settings/columns`}>
                    <MenuItem>Arrange Columns&hellip;</MenuItem>
                  </LinkContainer>
                </Dropdown.Menu>
              </Dropdown>
            </section>
          </th>
        </tr>
      </thead>
    );
  }

  @bind
  private onChangeSort(column: string, descending: boolean) {
    const { history } = this.props;
    const sort = `${descending ? '-' : ''}${column}`;
    history.replace({
      ...this.props.location,
      search: qs.stringify({ ...this.queryParams, sort }, {
        addQueryPrefix: true,
        encoder: encodeURI,
        arrayFormat: 'repeat',
      }),
    });
  }

  @action.bound
  private onChangeSelectAll(e: any) {
    if (e.target.checked) {
      for (const issue of this.props.issues.asList) {
        this.selection.add(issue.id);
      }
    } else {
      this.selection.clear();
    }
  }

  @computed
  private get columns(): string[] {
    const { prefs } = this.props;
    return prefs.columns;
  }

  @computed
  private get columnRenderers(): Map<string, ColumnRenderer> {
    const { project } = this.props;
    const columnRenderers = new Map<string, ColumnRenderer>();
    columnRenderers.set('reporter',
        new UserColumnRenderer('Reporter', 'reporter', 'reporter pad'));
    columnRenderers.set('owner', new UserColumnRenderer('Owner', 'owner', 'owner pad'));
    columnRenderers.set('created', new DateColumnRenderer('Created', 'created', 'created pad'));
    columnRenderers.set('updated', new DateColumnRenderer('Updated', 'updated', 'updated pad'));
    const template = project.template;
    if (template && template.loaded) {
      columnRenderers.set('state', new StateColumnRenderer(template));
      columnRenderers.set('type', new TypeColumnRenderer(template));
      for (const type of template.types) {
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
    const { issues, project } = this.props;
    const { sort, descending } = this.sortOrder();
    issues.sort = sort;
    issues.descending = descending;
    issues.filterParams = {};
    issues.filterParams.search = this.queryParams.search;
    issues.group = this.queryParams.group;
    for (const key of Object.getOwnPropertyNames(this.queryParams)) {
      if (key in descriptors || key.startsWith('custom.') || key.startsWith('pred.')) {
        const desc = descriptors[key];
        let value: any = this.queryParams[key];
        if (desc && desc.type === OperandType.USER && value === 'me') {
          value = session.account.uname;
        } else if (desc && desc.type === OperandType.STATE_SET && value === 'open') {
          value = project.template.states.filter(st => !st.closed).map(st => st.id);
        }
        issues.filterParams[key] = value;
      }
    }
  }

  // Checkbox 'indeterminate' state can only be set programmatically.
  private updateSelectAll() {
    if (this.selectAllEl) {
      const noneSelected = this.selection.size === 0;
      let allSelected = true;
      for (const issue of this.props.issues.asList) {
        if (!this.selection.has(issue.id)) {
          allSelected = false;
          break;
        }
      }
      this.selectAllEl.indeterminate = !allSelected && !noneSelected;
    }
  }
}
