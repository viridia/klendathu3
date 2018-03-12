import bind from 'bind-decorator';
import { Account } from 'klendathu-json-types';
import * as React from 'react';
import { Autocomplete } from '../ac/Autocomplete';
import { Chip } from '../ac/Chip';
import { searchAccounts } from '../../network/requests';

interface Props {
  className: string;
  placeholder?: string;
  autoFocus?: boolean;
  multiple?: boolean;
  selection: Account | Account[];
  onSelectionChange: (selection: Account | Account[] | null) => void;
}

export class UserAutocomplete extends React.Component<Props> {
  private token: string = null;

  public render() {
    return (
      <Autocomplete
          {...this.props}
          onSearch={this.onSearch}
          onGetValue={this.onGetValue}
          onGetSortKey={this.onGetSortKey}
          onRenderSuggestion={this.onRenderSuggestion}
          onRenderSelection={this.onRenderSelection}
      />
    );
  }

  @bind
  private onSearch(token: string, callback: (suggestions: Account[]) => void) {
    this.token = token;
    if (token.length < 1) {
      callback([]);
    } else {
      searchAccounts(this.token, { type: 'user', limit: 5 }, accounts => {
        if (token === this.token) {
          callback(accounts);
        }
      });
    }
  }

  @bind
  private onRenderSuggestion(user: Account): JSX.Element {
    return (
      <span>
        <span className="name">{user.display}</span>
        &nbsp;- <span className="username">{user.uname}</span>
      </span>
    );
  }

  @bind
  private onRenderSelection(user: Account): JSX.Element {
    return (
      <Chip>
        <span className="name">{user.display}</span>
        &nbsp;- <span className="username">{user.uname}</span>
      </Chip>
    );
  }

  @bind
  private onGetValue(user: Account): string {
    return user.uname;
  }

  @bind
  private onGetSortKey(user: Account): string {
    return user.display;
  }
}
