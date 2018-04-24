import * as React from 'react';
import { WorkflowState } from 'klendathu-json-types';
import { StateCard } from './StateCard';

import './workflow.scss';

interface Props {
  states: WorkflowState[];
}

export function WorkflowList({ states }: Props) {
  return (
    <section className="workflow-list">
      {states.map(state => <StateCard key={state.id} state={state} states={states} />)}
    </section>
  );
}
