import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Collapse, Form, FormControl } from 'react-bootstrap';
import { DiscloseButton } from '../common/DiscloseButton';
import { Project, IssueListQuery } from '../../models';
import { FilterTermEditor } from './FilterTermEditor';
import { FilterTerm } from './FilterTerm';
import { SaveFilterDialog } from './SaveFilterDialog';
import { getDescriptor } from './FilterTermDescriptor';
import { action, computed, IObservableArray, observable } from 'mobx';
import { observer } from 'mobx-react';
import bind from 'bind-decorator';
import * as qs from 'qs';

import './FilterParams.scss';

import CloseIcon from '../../../icons/ic_close.svg';

interface Props extends RouteComponentProps<{}> {
  project: Project;
  issues: IssueListQuery;
}

@observer
export class FilterParams extends React.Component<Props> {
  @observable private expanded = false;
  @observable private search = '';
  @observable private showSaveDialog = false;
  @observable private terms = [] as IObservableArray<FilterTerm>;

  public componentWillMount() {
    const { location } = this.props;
    this.parseQuery(location.search);
  }

  public componentWillReceiveProps(nextProps: Props) {
    const { location } = nextProps;
    if (location.search !== this.props.location.search) {
      this.parseQuery(location.search);
    }
  }

  public render() {
    return (
      <section className="card filter-params">
        <header className="filters">
          <DiscloseButton checked={this.expanded} onClick={this.onChangeExpanded} />
          Filters
          <div className="separator" />
          <div className="search-group">
            <Form onSubmit={this.onSearch}>
              <FormControl
                  className="search"
                  placeholder="Search"
                  value={this.search}
                  onChange={this.onChangeSearch}
              />
              <Button className="clear" onClick={this.onClearSearch}><CloseIcon /></Button>
            </Form>
          </div>
        </header>
        {this.renderFilterTerms()}
      </section>);
  }

  private renderFilterTerms() {
    const { project, location } = this.props;
    return (
      <Collapse in={this.expanded}>
        <section className="term-list">
          {this.terms.map((term, index) => (
            <FilterTermEditor
                index={index}
                key={index}
                term={term}
                termsUsed={this.termsUsed}
                project={project}
                onRemove={this.onRemoveTerm}
                onChange={this.onChangeTerm}
            />))}
          <FilterTermEditor
              project={project}
              termsUsed={this.termsUsed}
              onRemove={this.onRemoveTerm}
              onChange={this.onChangeTerm}
          >
            <Button
                bsStyle="default"
                bsSize="small"
                onClick={this.onClearFilter}
                disabled={this.terms.length === 0}
            >
              Clear
            </Button>
            <Button
                bsStyle="default"
                bsSize="small"
                onClick={this.onSaveFilter}
                disabled={this.terms.length === 0}
            >
              Save Filter As&hellip;
            </Button>
            <Button
                bsStyle="primary"
                bsSize="small"
                onClick={this.onApplyFilter}
                disabled={location.search === this.queryString}
            >
              Apply Filter
            </Button>
          </FilterTermEditor>
          {this.showSaveDialog &&
            <SaveFilterDialog
                project={project}
                filter={this.queryString}
                onHide={this.onCloseSaveDialog}
            />}
        </section>
      </Collapse>
    );
  }

  @action.bound
  private onChangeSearch(e: any) {
    this.search = e.target.value;
  }

  @action.bound
  private onClearSearch(e: any) {
    e.preventDefault();
    this.search = '';
    this.onApplyFilter(e);
  }

  @action.bound
  private onChangeExpanded() {
    this.expanded = !this.expanded;
  }

  @action.bound
  private onChangeTerm(index: number | undefined, term: FilterTerm) {
    if (index !== undefined) {
      this.terms[index] = term;
    } else {
      this.terms.push(term);
    }
  }

  @action.bound
  private onRemoveTerm(index: number) {
    this.terms.splice(index, 1);
  }

  @bind
  private onSearch(e: any) {
    e.preventDefault();
    this.terms.clear();
    this.pushFilter();
  }

  @bind
  private onApplyFilter(e: any) {
    e.preventDefault();
    this.pushFilter();
  }

  @action.bound
  private onSaveFilter(e: any) {
    e.preventDefault();
    this.showSaveDialog = true;
  }

  @action.bound
  private onCloseSaveDialog() {
    this.showSaveDialog = false;
  }

  @action.bound
  private onClearFilter(e: any) {
    this.terms.clear();
    this.pushFilter();
  }

  @computed
  private get termsUsed() {
    const result = new Set<string>();
    for (const term of this.terms) {
      result.add(term.fieldId);
    }
    return result;
  }

  @computed
  private get queryString(): string {
    const { location } = this.props;
    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    const newQuery: { [key: string]: string } = {};
    if (query.sort) {
      newQuery.sort = query.sort;
    }
    if (this.search) {
      newQuery.search = this.search;
    }
    // Add new terms
    this.terms.forEach(term => {
      term.descriptor.buildQuery(newQuery, term);
    });
    return qs.stringify(newQuery, {
      addQueryPrefix: true, encoder: encodeURI, arrayFormat: 'repeat' });
  }

  private pushFilter() {
    const { history } = this.props;
    history.push({ ...this.props.location, search: this.queryString });
  }

  private parseQuery(search: string) {
    const { project } = this.props;
    const query = qs.parse(search, { ignoreQueryPrefix: true });
    this.search = query.search || '';
    const terms: FilterTerm[] = [];
    for (const key of Object.getOwnPropertyNames(query)) {
      const descriptor = getDescriptor(project, key);
      if (descriptor) {
        const term: FilterTerm = observable({
          fieldId: key,
          descriptor,
          value: null,
          predicate: null,
        });
        descriptor.parseQuery(query, term, project);
        terms.push(term);
      }
    }
    this.terms.replace(terms);
  }
}
