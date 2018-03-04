import * as React from 'react';
import { Button } from 'react-bootstrap';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import bind from 'bind-decorator';
import { ProjectList } from './ProjectList';
import { Memberships } from '../../models/Memberships';
import { CreateProjectDialog } from './CreateProjectDialog';
import { session } from '../../models/Session';
// import { authModel } from '../../models/AuthModel';

import AddBoxIcon from '../../../icons/ic_add_box.svg';

interface Props {
  memberships: Memberships;
}

@observer
export class ProjectListView extends React.Component<Props> {
  @observable private openCreate = false;

  public render() {
    if (!session.account) {
      return <section className="kdt content projects-view" />;
    }
    return (
      <section className="kdt content projects-view">
        <header>
          <div className="title">
            Projects
          </div>
          <Button bsStyle="primary" onClick={this.onClickAddProject}>
            <AddBoxIcon />
            <span>New Project&hellip;</span>
          </Button>
        </header>
        <ProjectList memberships={this.props.memberships} />
        <CreateProjectDialog show={this.openCreate} onHide={this.onCloseCreate} />
      </section>
    );
  }

  @bind
  private onClickAddProject(e: any) {
    this.openCreate = true;
  }

  @bind
  private onCloseCreate() {
    this.openCreate = false;
  }
}
