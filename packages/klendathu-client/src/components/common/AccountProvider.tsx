import * as React from 'react';
import { accounts } from '../../models/AccountStore';
import { Account as AccountData } from 'klendathu-json-types';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

interface Props {
  account: string;
  render: (accont: AccountData) => React.ReactNode;
}

/** Component which looks up an account by name and provides the account id to children. */
@observer
export class AccountProvider extends React.Component<Props> {
  @observable.ref private account: AccountData = null;

  public componentWillMount() {
    accounts.byName(this.props.account).then(account => {
      this.account = account;
    });
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.account !== this.props.account) {
      accounts.byName(nextProps.account).then(account => {
        this.account = account;
      });
    }
  }

  public render() {
    const { render } = this.props;
    return this.account ? render(this.account) : null;
  }
}
