import * as React from 'react';
import * as classNames from 'classnames';
import { Project } from '../../models';
import { Label } from 'klendathu-json-types';
import {
  Button,
  Checkbox,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Modal,
} from 'react-bootstrap';
// import { createLabel, updateLabel, getLabel } from '../../requests/labels';
import LABEL_COLORS from '../common/labelColors'; // tslint:disable-line
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { toast } from 'react-toastify';

import '../ac/Chip.scss';
import './LabelDialog.scss';

interface Props {
  projectRef: Project;
  labelId?: number;
  onHide: () => void;
  onInsertLabel: (label: Label) => void;
  visible?: boolean;
}

@observer
export class LabelDialog extends React.Component<Props> {
  @observable private labelName: string = '';
  @observable private color: string = '#e679f8';
  @observable private visible: boolean = true;
  @observable private busy: boolean = false;

  public componentWillMount() {
    if (this.props.labelId) {
      this.getLabelInfo(this.props.labelId);
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.labelId && !this.props.labelId) {
      this.getLabelInfo(nextProps.labelId);
    }
  }

  public render() {
    const { labelId, onHide } = this.props;
    return (
      <Modal
          show={true}
          onHide={onHide}
          dialogClassName="create-label"
      >
        <Modal.Header closeButton={true}>
          {labelId
              ? <Modal.Title>Edit Label</Modal.Title>
              : <Modal.Title>Create Label</Modal.Title>}
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={this.onSubmit}>
            <FormGroup controlId="name">
              <ControlLabel>Label text</ControlLabel>
              <FormControl
                  type="text"
                  value={this.labelName}
                  placeholder="Text for this label"
                  autoFocus={true}
                  maxLength={64}
                  onChange={this.onChangeLabelText}
              />
              <FormControl.Feedback />
            </FormGroup>
            <FormGroup controlId="visible">
              <Checkbox checked={this.visible} onChange={this.onChangeVisible}>
                Show in hotlist
              </Checkbox>
            </FormGroup>
            <FormGroup controlId="color">
              <ControlLabel>Label color</ControlLabel>
              <div className="color-table">
                {LABEL_COLORS.map((row, index) => (
                  <div className="color-column" key={index}>
                    {row.map(color =>
                      <button
                          className={classNames('color-selector',
                            { selected: color === this.color })}
                          key={color}
                          data-color={color}
                          style={{ backgroundColor: color }}
                          onClick={this.onChangeLabelColor}
                      >
                        A
                      </button>)}
                  </div>))}
              </div>
            </FormGroup>
            <FormGroup controlId="preview">
              <ControlLabel>Label preview:</ControlLabel>
              <div
                  className="label-preview chip"
                  style={{ backgroundColor: this.color }}
              >
                <span className="title">{this.labelName || '???'}</span>
              </div>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onHide}>Cancel</Button>
          <Button
              onClick={this.onSubmit}
              disabled={this.labelName.length < 3 || this.busy}
              bsStyle="primary"
          >
            {labelId ? 'Save' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>);
  }

  @action.bound
  private onChangeLabelText(e: any) {
    this.labelName = e.target.value;
  }

  @action.bound
  private onChangeVisible(e: any) {
    this.visible = e.target.checked;
  }

  @action.bound
  private onChangeLabelColor(e: any) {
    e.preventDefault();
    this.color = e.target.dataset.color;
  }

  @action.bound
  private onSubmit() {
    const { labelId, projectRef: project } = this.props;
    if (this.labelName.length < 3) {
      return;
    }
    const labelInput = { color: this.color, name: this.labelName };
    this.busy = true;
    const result: Promise<Label> = null;
    // if (labelId) {
    //   result = updateLabel(project.owner, project.id, labelId, labelInput).then(resp => {
    //     return resp;
    //   });
    // } else {
    //   result = createLabel(project.owner, project.id, labelInput).then(resp => {
    //     return resp;
    //   });
    // }

    result.then(updatedLabel => {
      this.busy = false;
      this.props.onHide();
      this.props.onInsertLabel(updatedLabel);
      // if (!label || this.props.visible !== this.visible) {
      //   const update: { labelsToAdd?: number[]; labelsToRemove?: number[]; } = {};
      //   if (this.visible) {
      //     update.labelsToAdd = [updatedLabel.id];
      //   } else {
      //     update.labelsToRemove = [updatedLabel.id];
      //   }
      //
      //   setProjectPrefs(project.id, update).then(() => {
      //     this.props.onInsertLabel(updatedLabel);
      //     this.setState({ busy: false });
      //     this.props.onHide();
      //   });
      // } else {
      //   this.props.onInsertLabel(updatedLabel);
      //   this.setState({ busy: false });
      //   this.props.onHide();
      // }
    }, error => {
      console.error(error);
      if (error.response && error.response.data && error.response.data.err) {
        switch (error.response.data.err) {
          case 'no-project':
            toast.error('Invalid project id');
            break;
          default:
            toast.error(`Server returned '${error.response.data.err}'`);
            console.error('response:', error.response);
            break;
        }
      } else {
        toast.error(error.message);
      }
      this.setState({ busy: false });
      this.props.onHide();
    });
  }

  private getLabelInfo(labelId: number) {
    const { projectRef } = this.props;
    // getLabel(projectRef.owner, projectRef.id, labelId).then(label => {
    //   if (label) {
    //     this.labelName = label.name;
    //     this.color = label.color;
    //     // TODO: How to handle visible?
    //   }
    // });
  }
}
