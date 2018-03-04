import { IssueRecord } from '../../../../../types/json';
import * as React from 'react';
import RelativeDate from '../../common/RelativeDate';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';

export class DateColumnRenderer extends AbstractColumnRenderer {
  public render(issue: IssueRecord) {
    return (
      <td className={this.className} key={this.fieldName}>
        <RelativeDate date={new Date((issue as any)[this.fieldName])} brief={true} />
      </td>
    );
  }
}
