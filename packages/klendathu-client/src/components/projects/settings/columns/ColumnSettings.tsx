import bind from 'bind-decorator';
import { Project, ProjectPrefs, Template } from 'common/api';
import * as Immutable from 'immutable';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { DefaultChildProps, graphql } from 'react-apollo';
import { Button } from 'react-bootstrap';
import { toastr } from 'react-redux-toastr';
import { setProjectPrefs } from '../../../../store/reducers/projectPrefs';
import { Column } from './Column';
import ColumnList from './ColumnList';
import './ColumnSettings.scss';

import * as ProjectPrefsQuery from '../../../../graphql/queries/projectPrefs.graphql';

interface Props {
  project: Project;
  template: Template;
}

interface Data {
  projectPrefs: ProjectPrefs;
}

interface State {
  visible: Immutable.List<string>;
  original: Immutable.List<string>;
  busy: boolean;
}

/** Component which allows editing the list of columns. */
class ColumnSettings extends React.Component<DefaultChildProps<Props, Data>, State> {
  public static contextTypes = {
    profile: PropTypes.shape({}),
  };

  private columns: Column[];
  private columnMap: Map<string, Column>;

  constructor(props: DefaultChildProps<Props, Data>) {
    super(props);
    this.buildColumnList();
    let visible = Immutable.List.of('type', 'state', 'owner', 'updated');
    if (this.props.data && this.props.data.projectPrefs &&
        this.props.data.projectPrefs.columns) {
      visible = Immutable.List(this.props.data.projectPrefs.columns);
    }
    this.state = {
      visible,
      original: visible,
      busy: false,
    };
  }

  public componentWillReceiveProps(nextProps: DefaultChildProps<Props, Data>) {
    if (nextProps.data && nextProps.data.projectPrefs &&
        nextProps.data.projectPrefs.columns) {
      const columns = Immutable.List(nextProps.data.projectPrefs.columns)
          .filter(id => this.columnMap.has(id)) as Immutable.List<string>;
      this.setState({ visible: columns, original: columns });
    }
  }

  public render() {
    const { projectPrefs, loading } = this.props.data;
    const { visible } = this.state;
    if (loading || !projectPrefs) {
      return <section className="settings-tab-pane" />;
    }
    const visibleColumns = visible.map(id => this.columnMap.get(id)).toArray();
    const availableColumns = this.columns.filter(col => visible.indexOf(col.id) < 0);
    const canSave = !Immutable.is(this.state.visible, this.state.original) && !this.state.busy;
    return (
      <section className="settings-tab-pane">
        <header>
          <div className="title">Issue List Columns</div>
          <Button bsStyle="primary" onClick={this.onSave} disabled={!canSave}>
            Save
          </Button>
        </header>
        <section className="column-selection">
          <section className="columns">
            <header>Available Columns</header>
            <ColumnList columns={availableColumns} onDrop={this.onDrop} />
          </section>
          <section className="columns">
            <header>Visible Columns</header>
            <ColumnList columns={visibleColumns} onDrop={this.onDrop} isVisible={true} />
          </section>
        </section>
      </section>);
  }

  @bind
  private onSave(e: any) {
    const { project } = this.props;
    e.preventDefault();
    this.setState({ busy: true });
    return setProjectPrefs(project.id, {
      columns: this.state.visible.toArray(),
    }).then(() => {
      this.setState({ busy: false, original: this.state.visible });
    }, error => {
      console.error(error);
      if (error.response && error.response.data && error.response.data.err) {
        toastr.error('Operation failed.', `Server returned '${error.response.data.err}'`);
      } else {
        toastr.error('Operation failed.', error.message);
      }
    });
  }

  @bind
  private onDrop(id: string, index: number, visible: boolean, makeVisible: boolean) {
    if (visible) {
      const oldIndex = this.state.visible.indexOf(id);
      if (!makeVisible) {
        this.setState({ visible: this.state.visible.delete(oldIndex) });
        return;
      }
      let newIndex = index;
      if (oldIndex > 0 && oldIndex < index) {
        newIndex -= 1;
      }
      this.setState({ visible: this.state.visible.delete(oldIndex).insert(newIndex, id) });
    } else {
      this.setState({ visible: this.state.visible.insert(index, id) });
    }
  }

  private buildColumnList() {
    const { template } = this.props;
    this.columns = [
      { id: 'created', title: 'Created' },
      { id: 'updated', title: 'Updated' },
      { id: 'type', title: 'Type' },
      { id: 'reporter', title: 'Reporter' },
      { id: 'owner', title: 'Owner' },
      { id: 'state', title: 'State' },
    ];
    this.columnMap = new Map();
    this.columns.forEach(col => { this.columnMap.set(col.id, col); });
    if (template) {
      for (const type of template.types) {
        for (const field of (type.fields || [])) {
          const columnId = `custom.${field.id}`;
          if (!this.columnMap.has(columnId)) {
            this.columns.push({ id: columnId, title: field.caption });
            this.columnMap.set(columnId, { id: columnId, title: field.caption });
          }
        }
      }
    }
  }
}

export default graphql(ProjectPrefsQuery, {
  options: ({ project }: Props) => ({ variables: { project: project.id } }),
})(ColumnSettings);
