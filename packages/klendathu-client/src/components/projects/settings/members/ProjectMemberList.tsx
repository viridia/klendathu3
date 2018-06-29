import * as React from 'react';
import { Membership, Role } from 'klendathu-json-types';
import { ObservableMemberList, Project, session } from '../../../../models';
import { RoleName } from '../../../common/RoleName';
import { AccountName } from '../../../common/AccountName';
import { Button } from 'react-bootstrap';
import { AddMemberDialog } from './AddMemberDialog';
import { RemoveMemberDialog } from './RemoveMemberDialog';
import { SetRoleDialog } from './SetRoleDialog';
import bind from 'bind-decorator';
import { computed, observable } from 'mobx';
import { observer } from 'mobx-react';

import './ProjectMemberList.scss';

interface Props {
  project: Project;
}

@observer
export class ProjectMemberList extends React.Component<Props> {
  @observable private showAddMember = false;
  @observable private setRoleUser: string = null;
  @observable private removeMemberUser: string = null;
  private projectMembers: ObservableMemberList;

  public componentWillMount() {
    const { project } = this.props;
    this.projectMembers = new ObservableMemberList('project', project.id);
  }

  public componentWillUnmount() {
    this.projectMembers.release();
  }

  public render() {
    const { project } = this.props;
    if (!this.projectMembers.loaded) {
      return <section className="settings-tab-pane" />;
    }
    return (
      <section className="settings-tab-pane">
        {this.showAddMember && <AddMemberDialog project={project} onHide={this.onHideAddMember}/>}
        {this.setRoleUser && (
          <SetRoleDialog user={this.setRoleUser} project={project} onHide={this.onHideSetRole}/>)}
        {this.removeMemberUser && (
          <RemoveMemberDialog
              user={this.removeMemberUser}
              project={project}
              onHide={this.onHideRemoveMember}
          />)}
        <header>
          <div className="title">Project members</div>
          {project.role >= Role.DEVELOPER &&
            <Button onClick={this.onShowAddMember}>Add Member</Button>}
        </header>
        <div className="card internal">
          <table className="fullwidth project-member-list">
            <thead>
              <tr className="heading">
                <th className="name left pad">Name</th>
                <th className="uname left pad">UserId</th>
                <th className="role left pad">Role</th>
                <th className="actions right pad">Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.members.map(m => this.renderMember(m))}
            </tbody>
          </table>
        </div>
      </section>);
  }

  private renderMember(member: Membership) {
    const { project } = this.props;
    const disabled = project.role < Role.MANAGER || project.role < member.role;
    return (
      <tr key={member.user}>
        <td className="name left pad"><AccountName id={member.user} /></td>
        <td className="uname left pad"><AccountName id={member.user} uname={true} /></td>
        <td className="role left pad"><RoleName role={member.role} /></td>
        <td className="actions right pad">
          &nbsp;
          {member.role < Role.OWNER && (
            <Button
                bsSize="small"
                bsStyle="danger"
                disabled={disabled}
                onClick={() => { this.onShowSetRole(member.user); }}
            >
              Change&hellip;
            </Button>
          )}
          {member.role < Role.OWNER && (
            <Button
                bsSize="small"
                bsStyle="danger"
                disabled={disabled}
                onClick={() => { this.onShowRemoveMember(member.user); }}
            >
              Remove
            </Button>
          )}
        </td>
      </tr>
    );
  }

  @computed
  private get members(): Membership[] {
    const members: Membership[] = [...this.projectMembers.members];
    if (session.account.type === 'user') {
      members.push({
        user: session.account.uid,
        role: Role.OWNER,
        created: this.props.project.created,
        updated: this.props.project.updated,
      });
    }
    return members;
  }

  @bind
  private onShowAddMember(e: any) {
    e.preventDefault();
    this.showAddMember = true;
  }

  @bind
  private onHideAddMember() {
    this.showAddMember = false;
  }

  @bind
  private onShowSetRole(user: string) {
    this.setRoleUser = user;
  }

  @bind
  private onHideSetRole() {
    this.setRoleUser = null;
  }

  @bind
  private onShowRemoveMember(user: string) {
    this.removeMemberUser = user;
  }

  @bind
  private onHideRemoveMember() {
    this.removeMemberUser = null;
  }
}
