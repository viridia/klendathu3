import { Issue } from 'klendathu-json-types';
import { Template } from '../../../models';
import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';

export class MilestoneColumnRenderer extends AbstractColumnRenderer {
  private template: Template;

  constructor(template: Template) {
    super('Milestone', 'milestone', 'milestone pad');
    this.template = template;
  }

  public render(issue: Issue) {
    const stateInfo = this.template.states.find(s => s.id === issue.state);
    if (!stateInfo) {
      return <td className="milestone pad" key="milestone">{issue.state}</td>;
    }
    return (
      <td className="milestone pad" key="milestone">{stateInfo.caption}</td>
    );
  }
}
