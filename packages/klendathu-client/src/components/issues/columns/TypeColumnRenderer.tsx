import { Issue } from 'klendathu-json-types';
import { Template } from '../../../models';
import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';

export class TypeColumnRenderer extends AbstractColumnRenderer {
  private template: Template;

  constructor(template: Template) {
    super('Type', 'type', 'type pad');
    this.template = template;
  }

  public renderGroupHeader(value: any): JSX.Element {
    const typeInfo = this.template.types.find(t => t.id === value);
    return (
      <header className="group-header">
        <span className="title">{this.title}: </span>
        <span className="value">{typeInfo ? typeInfo.caption : value}</span>
      </header>
    );
  }

  public render(issue: Issue) {
    const typeInfo = this.template.types.find(t => t.id === issue.type);
    if (!typeInfo) {
      return <td className="type" key="type">{issue.type}</td>;
    }
    return (
      <td className="type" key="type">
        <span style={{ backgroundColor: typeInfo.bg }}>{typeInfo.caption}</span>
      </td>
    );
  }
}
