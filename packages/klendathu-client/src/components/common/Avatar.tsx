import * as React from 'react';
import { accounts, ObservableAccount } from '../../models';
import { observer } from 'mobx-react';

import './Avatar.scss';

import * as DefaultAvatar from '../../../icons/default-avatar.png';

interface Props {
  id: string;
}

/** Component which displays the avatar photo of an account. */
@observer
export class Avatar extends React.Component<Props> {
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
    if (!this.account) {
      return <span className="avatar unassigned"/>;
    }

    if (!this.account.loaded) {
      return <span className="avatar loading"/>;
    }

    const photoUrl = this.account.photo || DefaultAvatar;
    return (
      <span className="avatar" style={{ backgroundImage: `url(${photoUrl})` }} />
    );
  }
}
