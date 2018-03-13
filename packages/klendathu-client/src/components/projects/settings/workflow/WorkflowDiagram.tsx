import { Workflow } from 'common/api';
import * as React from 'react';
import './workflow.scss';

interface Props {
  workflow: Workflow;
}

export default function WorkflowDiagram({ workflow }: Props) {
  const states = workflow && workflow.states ? workflow.states : [];
  return (
    <section className="workflow-diagram">
      {states.map(st => (
        <div className="workflow-node" key={st.id}>{st.caption}</div>
      ))}
    </section>
  );
}
