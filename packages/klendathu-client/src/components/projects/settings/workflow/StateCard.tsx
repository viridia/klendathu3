import * as React from 'react';
import bind from 'bind-decorator';
import * as classNames from 'classnames';
import { WorkflowState } from 'klendathu-json-types';
import { Checkbox, ControlLabel, FormControl } from 'react-bootstrap';
import { DiscloseButton } from '../../../common/DiscloseButton';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

import './workflow.scss';

interface Props {
  state: WorkflowState;
  states: WorkflowState[];
  //   addTransition: (transition: [string, string]) => void;
  //   removeTransition: (transition: [string, string]) => void;
  //   workflowUpdateState: (transition: [string, WorkflowState]) => void;
}

@observer
export class StateCard extends React.Component<Props> {
  @observable private expanded: boolean = false;
  @observable private caption: string = '';

  constructor(props: Props, context: any) {
    super(props, context);
    this.caption = props.state.caption;
  }

  public render() {
    const { state } = this.props;
    return (
      <section
          className={
            classNames('card internal workflow-state', { collapsed: !this.expanded })}
          key={state.id}
      >
        <header>
          <DiscloseButton checked={this.expanded} onClick={this.onChangeDisclose} />
          <div className="caption">{state.closed && 'Closed: '}{state.caption}</div>
          <div className="ident">{state.id}</div>
        </header>
        <div className="body">
          <table className="form-table">
            <tbody>
              <tr>
                <th><ControlLabel>Caption:</ControlLabel></th>
                <td>
                  <FormControl
                      className="summary"
                      type="text"
                      placeholder="display name of this state"
                      value={this.caption}
                      onChange={this.onChangeCaption}
                      onBlur={this.onCaptionBlur}
                  />
                  <Checkbox checked={this.props.state.closed} onChange={this.onChangeClosed}>
                    Closed
                  </Checkbox>
                </td>
              </tr>
              <tr>
                <th><ControlLabel>Transition to:</ControlLabel></th>
                <td className="to-states">
                  {this.renderTransitions()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  private renderTransitions() {
    return this.props.states.map(st => (
      <Checkbox
          key={st.id}
          data-id={st.id}
          checked={this.props.state.transitions.indexOf(st.id) >= 0}
          disabled={st.id === this.props.state.id}
          onChange={this.onChangeTransition}
      >
        {st.caption}
      </Checkbox>
    ));
  }

  @bind
  private onChangeDisclose(e: any) {
    e.preventDefault();
    this.expanded = !this.expanded;
  }

  // @bind
  // private onChangeName(e: any) {
  //   e.preventDefault();
  //   this.setState({ id: e.target.value });
  // }

  @bind
  private onChangeCaption(e: any) {
    e.preventDefault();
    this.caption = e.target.value;
  }

  @bind
  private onChangeClosed(e: any) {
    // const { state } = this.props;
    // this.props.workflowUpdateState([state.id, { ...state, closed: e.target.checked }]);
  }

  @bind
  private onChangeTransition(e: any) {
    // const id = e.target.dataset.id;
    // const { state } = this.props;
    // if (e.target.checked) {
    //   this.props.addTransition([state.id, id]);
    // } else {
    //   this.props.removeTransition([state.id, id]);
    // }
  }

  @bind
  private onCaptionBlur() {
    // const { state } = this.props;
    // this.props.workflowUpdateState([state.id, { ...state, caption: this.state.caption }]);
  }
}
