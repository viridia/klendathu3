import { Issue } from 'klendathu-json-types';
import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';
import { AccountName } from '../../common/AccountName';

export class UserColumnRenderer extends AbstractColumnRenderer {
  public render(issue: Issue) {
    const userId: string = (issue as any)[this.fieldName];
    if (!userId) {
      return (
        <td className={this.className} key={this.fieldName}>
          <div className="unassigned">unassigned</div>
        </td>
      );
    }
    return (
      <td className={this.className} key={this.fieldName}>
        <AccountName id={userId} />
      </td>
    );
  }
}
