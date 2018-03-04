import * as React from 'react';
import { RoleName } from '../common/RoleName';
import { AccountName } from '../common/AccountName';
import { Project as ProjectData } from 'klendathu-json-types';
import { Button, Modal } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Account, accounts, Memberships, request } from '../../models';
import bind from 'bind-decorator';
import { toast } from 'react-toastify';

import './ProjectCard.scss';

interface Props {
  project: ProjectData;
  memberships: Memberships;
}

@observer
export class ProjectCard extends React.Component<Props> {
  @observable private showDelete = false;
  private account: Account;

  public componentWillMount() {
    const { project } = this.props;
    const owner = project.id.split('/', 1)[0];
    this.account = accounts.byId(owner);
  }

  public componentWillUnmount() {
    this.account.release();
  }

  public render() {
    const { project, memberships } = this.props;
    const id = project.id.split('/', 2)[1];
    return (
      <div className="card internal project-card" key={project.id}>
        {this.showDelete && (
          <Modal show={true} onHide={this.onHideDelete}>
            <Modal.Header closeButton={true}>
              <Modal.Title>Delete Project</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you absolutely sure you want to delete this project?
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.onHideDelete}>Cancel</Button>
              <Button bsStyle="primary" onClick={this.onConfirmDelete}>Delete</Button>
            </Modal.Footer>
          </Modal>
        )}
        <div className="project-info">
          <div className="project-name">
            <NavLink
                className="project-link"
                to={{ pathname: `/${this.account.uname}/${id}/issues` }}
            >
              {id}
            </NavLink>
            <span className="description"> - {project.title}</span>
            <div className="owner">
              <span className="title">Owned by: </span> <AccountName id={project.owner} />
            </div>
          </div>
          <div className="project-owner">
            <div className="role">
              <span className="title">Role: </span>
              <RoleName role={memberships.getProjectRole(project)} />
            </div>
            <div className="description">{project.description}</div>
          </div>
          <div>
            <Button bsStyle="primary" onClick={this.onShowDelete}>Delete</Button>
          </div>
        </div>
      </div>
    );
  }

  @bind
  private onShowDelete(ev: any) {
    this.showDelete = true;
  }

  @bind
  private onHideDelete(ev: any) {
    this.showDelete = false;
  }

  @bind
  private onConfirmDelete(ev: any) {
    const { project } = this.props;
    this.setState({ showDelete: false });
    request.delete(`/api/projects/${project.id}`)
    .then(() => {
      toast.success(`Project '${project.title}' deleted.`);
      this.showDelete = false;
    }, error => {
      // TODO: Toast
      toast.error(`Error deleting project '${project.title}'.`);
      this.showDelete = false;
      console.error('Project delete error:', error);
    });
  }
}
