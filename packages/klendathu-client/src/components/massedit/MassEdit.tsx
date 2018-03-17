import * as React from 'react';
import bind from 'bind-decorator';
import { IssueEdit } from 'klendathu-json-types';
import { Button, Collapse } from 'react-bootstrap';
import { EditAction, MassAction } from './MassAction';
import { IObservableArray, observable } from 'mobx';
import { ObservableSet, Project } from '../../models';
import { deleteIssue, updateIssue } from '../../network/requests';
import { observer } from 'mobx-react';
import { toast } from 'react-toastify';

import './MassEdit.scss';

interface Props {
  project: Project;
  selection: ObservableSet;
}

@observer
export class MassEdit extends React.Component<Props> {
  @observable private actions = [] as IObservableArray<EditAction>;

  public render() {
    const { selection, project } = this.props;
    return (
      <Collapse in={selection.size > 0}>
        <section className="card mass-edit">
          <header className="filters">
            <div className="title">
              Mass Edit ({selection.size} issues selected)
            </div>
            <Button
                bsStyle="info"
                bsSize="small"
                disabled={this.actions.length === 0}
                onClick={this.onSave}
            >
              Apply Changes
            </Button>
          </header>
          <section className="action-list">
            {this.actions.map((action, index) => (
              <MassAction
                  index={index}
                  key={index}
                  action={action}
                  project={project}
                  onRemove={this.onRemoveAction}
                  onChange={this.onChangeAction}
              />))}
            <MassAction
                project={project}
                onRemove={this.onRemoveAction}
                onChange={this.onChangeAction}
            />
          </section>
        </section>
      </Collapse>);
  }

  @bind
  private onChangeAction(index: number, action: any) {
    if (index !== undefined) {
      this.actions[index] = action;
    } else {
      this.actions.push(action);
    }
  }

  @bind
  private onRemoveAction(index: number) {
    this.actions.splice(index, 1);
  }

  @bind
  private onSave(e: any) {
    e.preventDefault();
    const { selection } = this.props;
    const promises: Array<Promise<any>> = [];
    let deleted = false;
    selection.forEach(issueId => {
      const updates: Partial<IssueEdit> = {};
      this.actions.forEach(action => {
        if (action.id === 'delete') {
          deleted = true;
        } else {
          action.apply(updates, action.value);
        }
      });
      if (deleted) {
        promises.push(deleteIssue(issueId));
      } else {
        promises.push(updateIssue(issueId, updates));
      }
    });

    Promise.all(promises).then(() => {
      if (deleted) {
        toast.success(`${selection.size} issues deleted.`);
        selection.clear();
      } else {
        toast.success(`${selection.size} issues updated.`);
      }
    });
  }
}
