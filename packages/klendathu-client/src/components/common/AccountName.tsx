import * as React from 'react';
import { accounts, ObservableAccount } from '../../models';
import { observer } from 'mobx-react';

interface Props {
  id: string;
  full?: boolean;
  uname?: boolean;
}

/** Component which displays the name of an account. */
@observer
export class AccountName extends React.Component<Props> {
  private account: ObservableAccount;

  public componentWillMount() {
    if (this.props.id) {
      this.account = accounts.byId(this.props.id);
    }
  }

  public componentWillUnmount() {
    if (this.account) {
      this.account.release();
    }
  }

  public render() {
    const { uname } = this.props;

    if (!this.account) {
      return <span className="name unassigned">unassigned</span>;
    }

    if (!this.account.loaded) {
      return <span className="name loading" />;
    }

    if (uname) {
      return (
        <span className="name">
          <span className="uname">{this.account.uname}</span>
        </span>
      );
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
