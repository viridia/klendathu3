import * as React from 'react';
import { accounts, ObservableAccount } from '../../models';
import { observer } from 'mobx-react';

interface Props {
  id: string;
  full?: boolean;
}

/** Component which displays the name of an account. */
@observer
export class AccountName extends React.Component<Props> {
  private account: ObservableAccount;

  public componentWillMount() {
    this.account = accounts.byId(this.props.id);
  }

  public componentWillUnmount() {
    this.account.release();
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
