import * as React from 'react';
import { Membership, Role } from 'klendathu-json-types';
import { ObservableMemberList, Project, session } from '../../../../models';
import { RoleName } from '../../../common/RoleName';
import { AccountName } from '../../../common/AccountName';
import { Button } from 'react-bootstrap';
import { AddMemberDialog } from './AddMemberDialog';
import bind from 'bind-decorator';
import { computed, observable } from 'mobx';
import { observer } from 'mobx-react';

interface Props {
  project: Project;
}

@observer
export class ProjectMemberList extends React.Component<Props> {
  @observable private showAddMember = false;
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
        {this.showAddMember && (
          <AddMemberDialog
              project={project}
              onHide={this.onHideAddMember}
          />)}
        <header>
          <div className="title">Project members for: {project.title}</div>
          {project.role >= Role.DEVELOPER &&
            <Button onClick={this.onShowAddMember}>Add Member</Button>}
        </header>
        <div className="card internal">
          <table className="fullwidth">
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
    return (
      <tr key={member.user}>
        <td className="name left pad"><AccountName id={member.user} /></td>
        <td className="uname left pad"><AccountName id={member.user} uname={true} /></td>
        <td className="role left pad"><RoleName role={member.role} /></td>
        <td className="actions right pad">&nbsp;</td>
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
}
