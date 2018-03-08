import * as React from 'react';
import { Memberships, Project, projects } from '../../models';
import { Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Account, Role } from 'klendathu-json-types';
import { observer } from 'mobx-react';

import AddBoxIcon from '../../../icons/ic_add_box.svg';

interface Props {
  account: Account;
  project: string;
  memberships: Memberships;
}

@observer
export class NewIssueButton extends React.Component<Props> {
  private project: Project;

  public componentWillMount() {
    const { memberships, account, project } = this.props;
    this.project = projects.get(account.uid, project, memberships);
  }

  public componentWillUnmount() {
    this.project.release();
  }

  public render() {
    if (this.project && this.project.loaded && this.project.role >= Role.REPORTER) {
      const { account, project } = this.props;
      return (
        <LinkContainer to={`/${account.uname}/${project}/new`} className="header-link">
          <Button bsStyle="primary">
            <AddBoxIcon />
            <span>New Issue</span>
          </Button>
        </LinkContainer>
      );
    }
    return null;
  }
}
