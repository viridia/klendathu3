import bind from 'bind-decorator';
import { Account as AccountData } from 'klendathu-json-types';
import * as React from 'react';
import { Autocomplete } from '../ac/Autocomplete';
import { Chip } from '../ac/Chip';
import { request } from '../../models';

interface Props {
  className: string;
  placeholder?: string;
  autoFocus?: boolean;
  multiple?: boolean;
  selection: AccountData | AccountData[];
  onSelectionChange: (selection: AccountData | AccountData[] | null) => void;
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
  private onSearch(token: string, callback: (suggestions: AccountData[]) => void) {
    this.token = token;
    if (token.length < 1) {
      callback([]);
    } else {
      request.get('/api/names', { params: { search: this.token }}).then(resp => {
        if (token === this.token) {
          callback(resp.data);
        }
      });
    }
  }

  @bind
  private onRenderSuggestion(user: AccountData): JSX.Element {
    return (
      <span>
        <span className="name">{user.display}</span>
        &nbsp;- <span className="username">{user.uname}</span>
      </span>
    );
  }

  @bind
  private onRenderSelection(user: AccountData): JSX.Element {
    return (
      <Chip>
        <span className="name">{user.display}</span>
        &nbsp;- <span className="username">{user.uname}</span>
      </Chip>
    );
  }

  @bind
  private onGetValue(user: AccountData): string {
    return user.uname;
  }

  @bind
  private onGetSortKey(user: AccountData): string {
    return user.display;
  }
}
