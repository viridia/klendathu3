import { IssueRecord, Template } from '../../../../../types/json';
import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';

export class TypeColumnRenderer extends AbstractColumnRenderer {
  private template: Template;

  constructor(template: Template) {
    super('Type', 'type', 'type pad');
    this.template = template;
  }

  public render(issue: IssueRecord) {
    const typeInfo = this.template.types.find(t => t.id === issue.type);
    return (
      <td className="type" key="type">
        <span style={{ backgroundColor: typeInfo.bg }}>{typeInfo.caption}</span>
      </td>
    );
  }
}
