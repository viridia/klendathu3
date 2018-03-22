import * as React from 'react';
import { Account, Role } from 'klendathu-json-types';
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
import { Checkbox } from 'react-bootstrap';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import bind from 'bind-decorator';
import * as qs from 'qs';

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
    this.queryParams = qs.parse(location.search.slice(1));
    this.updateQuery();
  }

  public componentDidUpdate() {
    this.updateSelectAll();
  }

  public render() {
    const { issues, project } = this.props;
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
          <div className="card issue">
            <table className="issue">
              {this.renderHeader()}
              <tbody>
                {issues.asList.map(i => (
                  <IssueListEntry
                      {...this.props}
                      key={i}
                      issueId={i}
                      columnRenderers={this.columnRenderers}
                      selection={this.selection}
                  />))}
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
      for (const id of this.props.issues.asList) {
        this.selection.add(id);
      }
    } else {
      this.selection.clear();
    }
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
    for (const key of Object.getOwnPropertyNames(this.queryParams)) {
      if (key in descriptors || key.startsWith('custom.') || key.startsWith('pred.')) {
        const desc = descriptors[key];
        let value: any = this.queryParams[key];
        if (desc && desc.type === OperandType.USER && value === 'me') {
          value = session.account.uid;
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
      for (const id of this.props.issues.asList) {
        if (!this.selection.has(id)) {
          allSelected = false;
          break;
        }
      }
      this.selectAllEl.indeterminate = !allSelected && !noneSelected;
    }
  }
}
