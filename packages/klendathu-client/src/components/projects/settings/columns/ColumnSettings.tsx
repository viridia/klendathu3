import * as React from 'react';
import { Project, ObservableProjectPrefs } from '../../../../models';
import { updateProjectPrefs } from '../../../../network/requests';
import { displayErrorToast } from '../../../common/displayErrorToast';
import { Button } from 'react-bootstrap';
import { Column } from './Column';
import { ColumnList } from './ColumnList';
import { computed, IObservableArray, observable } from 'mobx';
import { observer } from 'mobx-react';
import bind from 'bind-decorator';

import './ColumnSettings.scss';

interface Props {
  project: Project;
  prefs: ObservableProjectPrefs;
}

/** Component which allows editing the list of columns. */
@observer
export class ColumnSettings extends React.Component<Props> {
  @observable private busy = false;
  @observable private visible = ['type', 'state', 'owner', 'updated'] as IObservableArray<string>;
  @observable private original = [] as IObservableArray<string>;

  constructor(props: Props) {
    super(props);
    this.original.replace(props.prefs.columns);
    this.visible.replace(props.prefs.columns);
  }

  public render() {
    const { prefs } = this.props;
    if (!prefs || !prefs.loaded) {
      return <section className="settings-tab-pane" />;
    }
    const visibleColumns = this.visible.map(id => this.columnMap.get(id));
    const availableColumns = this.columns.filter(col => this.visible.indexOf(col.id) < 0);
    const canSave = this.isChanged && !this.busy;
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
    this.busy = true;
    return updateProjectPrefs(project.account, project.uname, {
      columns: this.visible.slice(),
    }).then(() => {
      this.busy = false;
    }, displayErrorToast);
  }

  @bind
  private onDrop(lcId: string, index: number, visible: boolean, makeVisible: boolean) {
    // Because DnD lowercases drag types.
    const col = this.columns.find(c => c.id.toLowerCase() === lcId);
    if (col) {
      if (visible) {
        const oldIndex = this.visible.indexOf(col.id);
        if (!makeVisible) {
          this.visible.splice(oldIndex, 1);
          return;
        }
        let newIndex = index;
        if (oldIndex > 0 && oldIndex < index) {
          newIndex -= 1;
        }
        this.visible.splice(oldIndex, 1);
        this.visible.splice(newIndex, 0, col.id);
      } else {
        this.visible.splice(index, 0, col.id);
      }
    }
  }

  @computed
  private get isChanged() {
    if (this.original.length !== this.visible.length) {
      return true;
    }
    for (let i = 0; i < this.original.length; i += 1) {
      if (this.original[i] !== this.visible[i]) {
        return true;
      }
    }
    return false;
  }

  @computed
  private get columns(): Column[] {
    const { project } = this.props;
    const columns: Column[] = [
      { id: 'created', title: 'Created' },
      { id: 'updated', title: 'Updated' },
      { id: 'type', title: 'Type' },
      { id: 'reporter', title: 'Reporter' },
      { id: 'owner', title: 'Owner' },
      { id: 'state', title: 'State' },
    ];
    if (project.template) {
      for (const type of project.template.types) {
        for (const field of (type.fields || [])) {
          const columnId = `custom.${field.id}`;
          if (!columns.find(col => col.id === columnId)) {
            columns.push({ id: columnId, title: field.caption });
          }
        }
      }
    }
    return columns;
  }

  @computed
  private get columnMap(): Map<string, Column> {
    const columnMap = new Map();
    this.columns.forEach(col => { columnMap.set(col.id, col); });
    return columnMap;
  }
}
