import * as React from 'react';
import bind from 'bind-decorator';
import { Workflow, WorkflowState } from 'klendathu-json-types';
import { Template } from '../../../models';
import { ControlLabel, FormGroup, Radio } from 'react-bootstrap';
import { observer } from 'mobx-react';

interface Props {
  state: string;
  prevState?: string;
  template: Template;
  workflow: Workflow;
  onStateChanged: (state: string) => void;
}

function caption(state: WorkflowState) {
  if (!state) {
    return null;
  }
  if (state.closed) {
    return <span>Closed: {state.caption}</span>;
  } else {
    return state.caption;
  }
}

/** Selects the state of the issue. */
@observer
export class StateSelector extends React.Component<Props> {
  public render() {
    const { workflow, state, prevState } = this.props;
    const nextState = state; // State we're going to
    const currState = prevState || state;
    const currStateInfo = this.props.template.getState(currState);
    let transitions: string[];
    if (prevState && currStateInfo) {
      transitions = currStateInfo.transitions;
      if (workflow && workflow.states) {
        const stateSet = new Set(workflow.states);
        transitions = transitions.filter(st => stateSet.has(st));
      }
    } else if (workflow) {
      if (workflow.start) {
        transitions = workflow.start;
      } else if (workflow.states) {
        transitions = workflow.states;
      }
      if (currState) {
        transitions = transitions.filter(st => st !== currState);
      }
    } else {
      transitions = this.props.template.states.map(st => st.id);
      if (currState) {
        transitions = transitions.filter(st => st !== currState);
      }
    }
    return (
      <FormGroup controlId="state">
        <ControlLabel>State</ControlLabel>
        {currState && <Radio
            checked={currState === nextState}
            data-state={currState}
            onChange={this.onChange}
            disabled={!workflow}
        >
          {caption(currStateInfo)}
        </Radio>}
        {transitions.map(s => {
          const toState = this.props.template.getState(s);
          return (
            <Radio
              key={toState.id}
              checked={toState.id === nextState}
              data-state={toState.id}
              onChange={this.onChange}
              disabled={!workflow}
            >
              {caption(toState)}
            </Radio>
          );
        })}
      </FormGroup>
    );
  }

  @bind
  private onChange(e: any) {
    this.props.onStateChanged(e.target.dataset.state);
  }
}
