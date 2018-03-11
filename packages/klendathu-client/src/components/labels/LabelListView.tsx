import * as React from 'react';
import { LabelListQuery, Project } from '../../models';
import { AccountName } from '../common/AccountName';
import { RelativeDate } from '../common/RelativeDate';
import { Label, Role, ProjectPrefs } from 'klendathu-json-types';
import { Button, Checkbox, Modal } from 'react-bootstrap';
import { LabelDialog } from './LabelDialog';
import { deleteLabel, addPrefsLabel, removePrefsLabel } from '../../network/requests';
import { displayErrorToast } from '../common/displayErrorToast';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';

import './LabelListView.scss';
import '../common/LabelName.scss';

interface Props {
  project: Project;
  prefs: ProjectPrefs;
}

@observer
export class LabelListView extends React.Component<Props> {
  @observable private showCreate = false;
  @observable private showDelete = false;
  @observable private labelToDelete?: Label = null;
  @observable private labelToUpdate: Label = null;
  @observable private busy = false;
  private query: LabelListQuery;

  public componentWillMount() {
    const { project } = this.props;
    this.query = new LabelListQuery(project.account, project.uname);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.project !== this.props.project) {
      const { project } = nextProps;
      this.query.release();
      this.query = new LabelListQuery(project.account, project.uname);
    }
  }

  public componentWillUnmount() {
    this.query.release();
  }

  public render() {
    const { project } = this.props;
    // if (error) {
    //   return <ErrorDisplay error={error} />;
    // }
    return (
      <section className="kdt content label-list">
        {this.showCreate && (
          <LabelDialog
              project={project}
              label={this.labelToUpdate}
              visible={this.labelToUpdate && this.visible.has(this.labelToUpdate.id)}
              onHide={this.onHideCreate}
              onInsertLabel={this.onCreateLabel}
          />)}
        {this.showDelete && (
          <Modal show={true} onHide={this.onHideDelete}>
            <Modal.Header closeButton={true}>
              <Modal.Title>Delete Label</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you absolutely sure you want to label &apos;{this.labelToDelete.name}&apos;?
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.onHideDelete}>Cancel</Button>
              <Button bsStyle="primary" onClick={this.onDeleteLabel} disabled={this.busy}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        )}
        <header>
          <span className="title">Labels</span>
          {project.role >= Role.DEVELOPER &&
              <Button bsStyle="primary" onClick={this.onShowCreate}>New Label</Button>}
        </header>
        {this.renderLabels()}
      </section>
    );
  }

  private renderLabels() {
    const { project } = this.props;
    if (this.query.length === 0) {
      return (
        <div className="card internal">
          {this.query.loaded && <div className="no-labels">No labels defined</div>}
        </div>
      );
    }
    return (
      <div className="card internal">
        <table>
          <thead>
            <tr className="heading">
              <th className="label-id center">#</th>
              <th className="visible center">Hotlist</th>
              <th className="name center">Label</th>
              <th className="owner center">Creator</th>
              <th className="created center">Created</th>
              {project.role >= Role.DEVELOPER && <th className="actions">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {this.query.asList.map(i => this.renderLabel(i))}
          </tbody>
        </table>
      </div>
    );
  }

  private renderLabel(label: Label) {
    const { project } = this.props;
    const id = label.id.split('/', 3)[2];
    return (
      <tr key={label.id}>
        <td className="label-id center">{id}</td>
        <td className="visible center">
          <Checkbox
              bsClass="cbox"
              data-id={label.id.split('/')[2]}
              checked={this.visible.has(label.id)}
              onChange={this.onChangeVisible}
          />
        </td>
        <td className="name center">
          <span className="label-name" style={{ backgroundColor: label.color }}>
            {label.name}
          </span>
        </td>
        <td className="creator center"><AccountName id={label.creator} /></td>
        <td className="created center"><RelativeDate date={label.created} /></td>
        {project.role >= Role.DEVELOPER && (<td className="actions center">
          <Button bsSize="small" data-label={label.id} onClick={e => this.onShowUpdate(label)}>
            Edit
          </Button>
          <Button bsSize="small" data-label={label.id} onClick={e => this.onShowDelete(label)}>
            Delete
          </Button>
        </td>)}
      </tr>);
  }

  @action.bound
  private onShowCreate() {
    this.showCreate = true;
    this.labelToUpdate = null;
  }

  @action.bound
  private onHideCreate() {
    this.showCreate = false;
  }

  @action.bound
  private onCreateLabel() {
    this.showCreate = false;
  }

  @action.bound
  private onShowDelete(label: Label) {
    this.showDelete = true;
    this.labelToDelete = label;
  }

  @action.bound
  private onHideDelete() {
    this.showDelete = false;
  }

  @action.bound
  private onDeleteLabel() {
    this.busy = true;
    deleteLabel(this.labelToDelete.id).then(() => {
      this.showDelete = false;
      this.busy = false;
    }, (error: any) => {
      displayErrorToast(error);
      this.showDelete = false;
      this.busy = false;
    });
  }

  @action.bound
  private onShowUpdate(label: Label) {
    this.showCreate = true;
    this.labelToUpdate = label;
  }

  @action.bound
  private onChangeVisible(e: any) {
    const { project } = this.props;
    const id = e.target.dataset.id;
    if (e.target.checked) {
      addPrefsLabel(project.account, project.uname, id).catch(displayErrorToast);
    } else {
      removePrefsLabel(project.account, project.uname, id).catch(displayErrorToast);
    }
  }

  @computed
  private get visible(): Map<string, boolean> {
    const visibleMap = new Map<string, boolean>(
        this.props.prefs.labels.map(label => [label, true] as [string, boolean]));
    return visibleMap;
  }
}
