import bind from 'bind-decorator';
import { Membership, Project, Role } from 'common/api';
import * as React from 'react';
import { DefaultChildProps, graphql } from 'react-apollo';
import { Button } from 'react-bootstrap';
import AddMemberDialog from './AddMemberDialog';

import * as ProjectMembershipsQuery from '../../../../graphql/queries/projectMemberships.graphql';

interface Props {
  project: Project;
}

interface Data {
  projectMemberships: Membership[];
}

interface State {
  showAddMember: boolean;
}

class ProjectMemberList extends React.Component<DefaultChildProps<Props, Data>, State> {
  constructor() {
    super();
    // this.onShowAddMember = this.onShowAddMember.bind(this);
    // this.onHideAddMember = this.onHideAddMember.bind(this);
    // this.onMemberAdded = this.onMemberAdded.bind(this);
    this.state = {
      showAddMember: false,
    };
  }

  public render() {
    const { projectMemberships, loading } = this.props.data;
    const { project } = this.props;
    if (loading || !projectMemberships) {
      return <section className="settings-tab-pane" />;
    }
    return (
      <section className="settings-tab-pane">
        {this.state.showAddMember && (
          <AddMemberDialog
              project={this.props.project}
              onHide={this.onHideAddMember}
              onAddMember={this.onMemberAdded}
          />)}
        <header>
          <div className="title">Project members for {this.props.project.name}</div>
          {project.role >= Role.DEVELOPER &&
            <Button onClick={this.onShowAddMember}>Add Member</Button>}
        </header>
        <div className="card report">
          <table>
            <thead>
              <tr className="heading">
                <th className="center">User</th>
                <th className="center">Role</th>
              </tr>
            </thead>
            <tbody>
              {projectMemberships.map(m => this.renderMember(m))}
            </tbody>
          </table>
        </div>
      </section>);
  }

  private renderMember(member: Membership) {
    return (
      <tr key={member.user}>
        <td className="center">{member.user}</td>
        <td className="center">{Role[member.role].toLowerCase()}</td>
      </tr>
    );
  }

  @bind
  private onShowAddMember(e: any) {
    e.preventDefault();
    this.setState({ showAddMember: true });
  }

  @bind
  private onHideAddMember() {
    this.setState({ showAddMember: false });
  }

  @bind
  private onMemberAdded() {
    this.props.data.refetch();
  }
}

export default graphql(ProjectMembershipsQuery, {
  options: ({ project }: Props) => ({ variables: { project: project.id } }),
})(ProjectMemberList);
