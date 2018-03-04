import * as React from 'react';
// import { Project } from '../../models/Project';
import { RouteComponentProps } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Role } from 'klendathu-json-types';
import { observer } from 'mobx-react';

import AddBoxIcon from '../../../icons/ic_add_box.svg';

type Props = RouteComponentProps<{ owner: string, project: string }>;

@observer
export class NewIssueButton extends React.Component<Props> {
  // private project: Project;
  private project: any;

  public componentWillMount() {
    // const { owner, project } = this.props.match.params;
    // this.project = new Project(owner, project);
  }

  public componentWillUnmount() {
    this.project.release();
  }

  public render() {
    if (this.project.value && this.project.value.role >= Role.REPORTER) {
      const { owner, project } = this.props.match.params;
      return (
        <LinkContainer to={`/${owner}/${project}/new`} className="header-link">
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
