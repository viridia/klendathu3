import { Template } from '../../../../models';
import * as React from 'react';

import './workflow.scss';

interface Props {
  template: Template;
}

export default function WorkflowDiagram({ template }: Props) {
  return (
    <section className="workflow-diagram">
      {template.states.map(st => (
        <div className="workflow-node" key={st.id}>{st.caption}</div>
      ))}
    </section>
  );
}
