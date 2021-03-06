import { Issue } from 'klendathu-json-types';
import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';

export class TextColumnRenderer extends AbstractColumnRenderer {
  public render(issue: Issue) {
    return (
      <td className={this.className} key={this.fieldName}>
        {(issue as any)[this.fieldName]}
      </td>
    );
  }
}
