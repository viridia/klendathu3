import * as React from 'react';
import { Project } from '../../models';
import { NameDisplay } from '../common/NameDisplay';
import { LabelListQuery } from '../../models/LabelListQuery';
import { Label, Role } from 'klendathu-json-types';
import * as dateFormat from 'dateformat';
import { Button, Checkbox, Modal } from 'react-bootstrap';
// import ErrorDisplay from '../debug/ErrorDisplay';
import { LabelDialog } from './LabelDialog';
// import { deleteLabel } from '../../requests/labels';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { toast } from 'react-toastify';

import './LabelListView.scss';
import '../common/LabelName.scss';

// interface Data {
//   labels: Label[];
//   projectPrefs: ProjectPrefs;
// }

interface Props {
  project: Project;
}

@observer
export class LabelListView extends React.Component<Props> {
  @observable private showCreate = false;
  @observable private showDelete = false;
  @observable private labelToDelete?: Label = null;
  @observable private labelToUpdate: number = null;
  @observable private visible = new Map<number, boolean>();
  @observable private busy = false;
  private query: LabelListQuery;

  public componentWillMount() {
    this.query = new LabelListQuery(this.props.project);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.project !== this.props.project) {
      this.query.release();
      this.query = new LabelListQuery(nextProps.project);
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
              projectRef={project}
              labelId={this.labelToUpdate}
              visible={this.visible.has(this.labelToUpdate)}
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
          {project.value.role >= Role.DEVELOPER &&
              <Button bsStyle="primary" onClick={this.onShowCreate}>New Label</Button>}
        </header>
        {this.renderLabels()}
      </section>
    );
  }

  private renderLabels() {
    const { project } = this.props;
    if (this.query.list.length === 0) {
      return (
        <div className="card internal">
          {!this.query.loading && <div className="no-labels">No labels defined</div>}
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
              {project.value.role >= Role.DEVELOPER && <th className="actions">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {this.query.list.map(i => this.renderLabel(i))}
          </tbody>
        </table>
      </div>
    );
  }

  private renderLabel(label: Label) {
    const { project } = this.props;
    return (
      <tr key={label.id}>
        <td className="label-id center">{label.id}</td>
        <td className="visible center">
          <Checkbox
              bsClass="cbox"
              data-id={label.id}
              checked={this.visible.has(label.id)}
              onChange={this.onChangeVisible}
          />
        </td>
        <td className="name center">
          <span className="label-name" style={{ backgroundColor: label.color }}>
            {label.name}
          </span>
        </td>
        <td className="creator center"><NameDisplay id={label.creator} /></td>
        <td className="created center">{dateFormat(label.created, 'mmm dS, yyyy h:MM TT')}</td>
        {project.value.role >= Role.DEVELOPER && (<td className="actions center">
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
    //
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
    const { project } = this.props;
    deleteLabel(project.owner, project.id, this.labelToDelete.id).then(() => {
      this.showDelete = false;
      this.busy = false;
    }, (error: any) => {
      console.error(error);
      if (error.response && error.response.data && error.response.data.err) {
        toast.error(`Server returned '${error.response.data.err}'`);
      } else {
        toast.error(error.message);
      }
      this.showDelete = false;
      this.busy = false;
    });
  }

  @action.bound
  private onShowUpdate(label: Label) {
    this.showCreate = true;
    this.labelToUpdate = label.id;
  }

  @action.bound
  private onChangeVisible(e: any) {
    // const { projectRef } = this.props;
    // const id = parseInt(e.target.dataset.id, 10);
    // if (e.target.checked) {
    //   setProjectPrefs(project.id, { labelsToAdd: [id] });
    // } else {
    //   setProjectPrefs(project.id, { labelsToRemove: [id] });
    // }
  }

  // private visibleSet(props: Props): Immutable.Set<number> {
  //   const { projectPrefs } = props.data;
  //   return Immutable.Set<number>(projectPrefs ? projectPrefs.labels : []);
  // }
}
