import { Issue } from 'klendathu-json-types';
import { Template } from '../../../models';
import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';

export class StateColumnRenderer extends AbstractColumnRenderer {
  private template: Template;

  constructor(template: Template) {
    super('State', 'state', 'state pad');
    this.template = template;
  }

  public renderGroupHeader(value: any): JSX.Element {
    const stateInfo = this.template.states.find(s => s.id === value);
    return (
      <header className="group-header">
        <span className="title">{this.title}: </span>
        <span className="value">{stateInfo ? stateInfo.caption : value}</span>
      </header>
    );
  }

  public render(issue: Issue) {
    const stateInfo = this.template.states.find(s => s.id === issue.state);
    if (!stateInfo) {
      return <td className="state pad" key="state">{issue.state}</td>;
    }
    return (
      <td className="state pad" key="state">{stateInfo.caption}</td>
    );
  }
}
