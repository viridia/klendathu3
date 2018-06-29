import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Project } from '../../../../models';
import { Milestone } from 'klendathu-json-types';
import bind from 'bind-decorator';
import { displayErrorToast } from '../../../common/displayErrorToast';
import { deleteMilestone } from '../../../../network/requests';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

import './RemoveMilestoneDialog.scss';

interface Props {
  milestone: Milestone;
  project: Project;
  onHide: () => void;
}

@observer
export class RemoveMilestoneDialog extends React.Component<Props> {
  @observable private busy = false;

  public render() {
    const { milestone } = this.props;
    return (
      <Modal
          show={true}
          onHide={this.props.onHide}
          dialogClassName="delete-milestone"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>Remove {milestone.name} from project?</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancel</Button>
          <Button
              onClick={this.onSubmit}
              disabled={this.busy}
              bsStyle="primary"
          >
            Remove
          </Button>
        </Modal.Footer>
      </Modal>);
  }

  @bind
  private onSubmit() {
    const { milestone, onHide } = this.props;
    this.busy = true;
    return deleteMilestone(milestone.id)
    .then(result => {
      this.busy = false;
      onHide();
    }, displayErrorToast);
  }
}
