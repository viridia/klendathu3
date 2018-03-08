import { ObservableIssue } from '../../../models/Issue';
import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';

export class TextColumnRenderer extends AbstractColumnRenderer {
  public render(issue: ObservableIssue) {
    return (
      <td className={this.className} key={this.fieldName}>
        {(issue as any)[this.fieldName]}
      </td>
    );
  }
}
