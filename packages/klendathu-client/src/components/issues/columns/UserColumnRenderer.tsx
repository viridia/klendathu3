import { ObservableIssue } from '../../../models';
import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';
import { Account } from 'klendathu-json-types';

export class UserColumnRenderer extends AbstractColumnRenderer {
  public render(issue: ObservableIssue) {
    const user: Account = (issue as any)[this.fieldName];
    return (
      <td className={this.className} key={this.fieldName}>
        {user
            ? (<div className="name">
              <span className="display">{user.display}</span>
            </div>)
            : <div className="unassigned">unassigned</div>}
      </td>
    );
  }
}
