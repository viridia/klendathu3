import { Issue as IssueData } from 'klendathu-json-types';
import * as React from 'react';
import { AbstractColumnRenderer } from './AbstractColumnRenderer';
import { Account } from '../../../models';

export class UserColumnRenderer extends AbstractColumnRenderer {
  public render(issue: IssueData) {
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
