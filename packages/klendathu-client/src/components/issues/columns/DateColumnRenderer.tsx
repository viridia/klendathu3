import { Issue } from '../../../models/Issue';
import * as React from 'react';
import { RelativeDate } from '../../common/RelativeDate';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';

export class DateColumnRenderer extends AbstractColumnRenderer {
  public render(issue: Issue) {
    return (
      <td className={this.className} key={this.fieldName}>
        <RelativeDate date={new Date((issue as any)[this.fieldName])} brief={true} />
      </td>
    );
  }
}
