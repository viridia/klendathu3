import * as React from 'react';
import { accounts } from '../../models/AccountStore';
import { Account } from '../../models/Account';
import { observer } from 'mobx-react';

interface Props {
  id: string;
}

@observer
export class AccountName extends React.Component<Props> {
  private account: Account;

  constructor(props: Props) {
    super(props);
    this.account = accounts.byId(props.id);
  }

  public render() {
    if (!this.account.loaded) {
      return <div className="name loading" />;
    }

    if (this.account.display) {
      return (
        <span className="name">
          <span className="display">{this.account.display}</span>
        </span>
      );
    }

    return (
      <span className="name missing">
        <span className="display">unknown user</span>
      </span>
    );
  }
}
