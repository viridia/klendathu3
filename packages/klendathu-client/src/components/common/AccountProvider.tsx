import * as React from 'react';
import { accounts } from '../../models';
import { Account } from 'klendathu-json-types';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

interface Props {
  account: string;
  children: (account: Account) => React.ReactNode;
}

/** Component which looks up an account by name and provides the account id to children. */
@observer
export class AccountProvider extends React.Component<Props> {
  @observable.ref private account: Account = null;

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
    const { children } = this.props;
    return this.account && this.account.type ? children(this.account) : null;
  }
}
