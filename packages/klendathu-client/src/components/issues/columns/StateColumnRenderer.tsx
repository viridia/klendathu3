import { ObservableIssue, Template } from '../../../models';
import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';

export class StateColumnRenderer extends AbstractColumnRenderer {
  private template: Template;

  constructor(template: Template) {
    super('State', 'state', 'state pad');
    this.template = template;
  }

  public render(issue: ObservableIssue) {
    const stateInfo = this.template.states.find(s => s.id === issue.state);
    if (!stateInfo) {
      return <td className="state pad" key="state">{issue.state}</td>;
    }
    return (
      <td className="state pad" key="state">{stateInfo.caption}</td>
    );
  }
}
