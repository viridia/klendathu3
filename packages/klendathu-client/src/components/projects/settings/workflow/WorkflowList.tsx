import { WorkflowState } from 'common/api';
import * as React from 'react';
// import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import { updateWorkflow } from '../../store/workflows';
import StateCard from './StateCard';
import './workflow.scss';

interface Props {
  states: WorkflowState[];
}

function WorkflowList({ states }: Props) {
  return (
    <section className="workflow-list">
      {states.map(state => <StateCard key={state.id} state={state} />)}
    </section>);
}

export default connect<Props, {}, undefined>(
  state => ({
    states: (state.workflows.states),
  }),
  null,
  // dispatch => bindActionCreators({ updateWorkflow }, dispatch),
)(WorkflowList);
