import bind from 'bind-decorator';
import * as classNames from 'classnames';
import * as React from 'react';
import { FormControl } from 'react-bootstrap';
import { action, IObservableArray, observable, observe, runInAction } from 'mobx';
import { observer } from 'mobx-react';

import './Autocomplete.scss';

export type SearchCallback<S> = (suggestion: S[], suffixActions?: any[]) => void;

interface Props<S> {
  className?: string;
  selection: S | S[];
  textValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  maxLength?: number;
  multiple?: boolean;
  suggest?: boolean;
  onSearch: (search: string, callback: SearchCallback<S>) => void;
  onChooseSuggestion?: (suggestion: S, callback: (suggestion: S) => void) => boolean;
  onRenderSuggestion?: (suggestion: S) => React.ReactNode;
  onRenderSelection: (suggestion: S) => React.ReactNode;
  onGetValue?: (suggestion: S) => string | number;
  onGetSortKey?: (suggestion: S) => string | number;
  onSelectionChange: (selection: S | S[] | null) => void;
  onValueChange?: (text: string) => void;
}

@observer
export class Autocomplete<S> extends React.Component<Props<S>> {
  public static defaultProps = {
    onChooseSuggestion: () => false,
    onRenderSuggestion: (suggestion: any) => suggestion,
    onGetValue: (suggestion: any) => suggestion,
    onGetSortKey: (suggestion: any) => ('' + suggestion).toLowerCase(),
  };

  @observable private open: boolean = false;
  @observable private valid: boolean = false;
  @observable private focused: boolean = false;
  @observable private suggestions = [] as IObservableArray<S>;
  @observable private suffixActions: any[] = [];
  @observable private suggestionIndex: number = -1;
  @observable private value: string = '';

  private searchValue: string = null;
  private timer: any = null;
  private menu: HTMLUListElement;
  private input: HTMLInputElement;
  private unobserve: () => void;

  public componentDidMount() {
    // Needed so that we can handle key event before auto-navigate.
    this.input.addEventListener('keydown', this.onKeyDown);
    this.unobserve = observe(this, 'open', change => {
      if (change.newValue && !change.oldValue) {
        this.menu.scrollIntoView(false);
      }
    });
  }

  public componentWillUnmount() {
    clearTimeout(this.timer);
    this.unobserve();
    this.input.removeEventListener('keydown', this.onKeyDown);
  }

  public addToSelection(item: S) {
    let selection = this.selection();
    for (const s of selection) {
      // Value is already in the list.
      if (this.props.onGetValue(item) === this.props.onGetValue(s)) {
        return;
      }
    }
    selection = selection.concat([item]);
    selection.sort((a, b) => {
      const aKey = this.props.onGetSortKey(a);
      const bKey = this.props.onGetSortKey(b);
      if (aKey < bKey) { return -1; }
      if (aKey < bKey) { return 1; }
      return 0;
    });
    this.updateSelection(selection);
  }

  public render() {
    const { className, maxLength, placeholder, autoFocus } = this.props;
    const selection = this.selection();
    const editing = this.textValue.length > 0;
    return (
      <div
          className={classNames('autocomplete dropdown',
            className, { valid: this.valid, open: this.open, focused: this.focused, editing })}
          onMouseDown={this.onClickContainer}
      >
        {this.renderSelection()}
        <FormControl
            type="text"
            bsClass="ac-input"
            placeholder={selection.length > 0 ? null : placeholder}
            inputRef={el => { this.input = el; }}
            autoFocus={autoFocus}
            value={this.textValue}
            maxLength={maxLength}
            onChange={this.onValueChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
        />
        <ul
            role="menu"
            ref={el => { this.menu = el; }}
            className="ac-menu dropdown-menu"
        >
          {this.renderSuggestions()}
        </ul>
      </div>
    );
  }

  private renderSuggestions(): JSX.Element[] {
    const { onGetValue, onRenderSuggestion } = this.props;
    // const { suggestions, suffixActions, suggestionIndex } = this.state;
    const menu = this.suggestions.map((s, index) => {
      const value = onGetValue(s);
      const active = index === this.suggestionIndex;
      return (
        <li
            className={classNames({ active })}
            key={value}
            role="presentation"
        >
          <a
              role="menuitem"
              tabIndex={-1}
              href=""
              data-index={index}
              onClick={e => this.onClickSuggestion(e, s)}
          >
            {onRenderSuggestion(s)}
          </a>
        </li>
      );
    });
    if (menu.length > 0 && this.suffixActions.length > 0) {
      menu.push(<hr key="-hr-" />);
    }
    const suffix = this.suffixActions.map((s, index) => {
      const value = onGetValue(s);
      const active = index === this.suggestionIndex - this.suggestions.length;
      return (
        <li
            className={classNames({ active })}
            key={value}
            role="presentation"
        >
          <a
              role="menuitem"
              tabIndex={-1}
              href=""
              data-index={index}
              onClick={e => this.onClickSuggestion(e, s)}
          >
            {onRenderSuggestion(s)}
          </a>
        </li>
      );
    });
    return menu.concat(suffix);
  }

  private renderSelection() {
    const selection = this.selection();
    const result = [];
    for (let i = 0; i < selection.length; i += 1) {
      const item = selection[i];
      const value = this.props.onGetValue(item);
      const last = (i === selection.length - 1) && this.textValue.length === 0;
      const chip = this.props.onRenderSelection(item);
      result.push(
        <span className={classNames('ac-chip-wrapper', { last })} key={value}>
          {chip}
        </span>,
      );
    }
    return result;
  }

  @action.bound
  private onValueChange(e: any) {
    let value = e.target.value;
    // Don't allow typing if it's a non-multiple and we already have a value.
    if (!this.props.suggest && !this.props.multiple && this.selection().length > 0) {
      value = '';
    }
    if (this.props.onValueChange) {
      this.props.onValueChange(value);
    } else {
      this.value = value;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      runInAction(() => {
        if (value !== this.searchValue) {
          this.searchValue = value;
          this.props.onSearch(this.searchValue, this.onReceiveSuggestions);
        }
      });
    }, 30);
  }

  @bind
  private onFocus() {
    this.focused = true;
    if (this.textValue.length === 0) {
      this.searchValue = this.value;
      this.props.onSearch(this.searchValue, this.onReceiveSuggestions);
    }
  }

  @action.bound
  private onBlur(e: any) {
    this.focused = false;
    this.open = false;
    // if (e.target !== this.input) {
    //   this.open = false;
    // }
  }

  @bind
  private onClickContainer(e: any) {
    e.preventDefault();
    this.input.focus();
  }

  @action.bound
  private onClickSuggestion(e: any, item: S) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.props.suggest) {
      if (this.props.onValueChange) {
        this.props.onValueChange('');
      } else {
        this.value = '';
      }
    }
    this.open = false;
    this.searchValue = '';
    this.chooseSuggestion(item);
  }

  @bind
  private onReceiveSuggestions(suggestions: S[], suffixActions: S[] = []) {
    const alreadySelected = new Set(this.selection().map(s => this.props.onGetValue(s)));
    const uniqueSuggestions =
      suggestions.filter(s => !alreadySelected.has(this.props.onGetValue(s)));
    const suggestionCount = uniqueSuggestions.length + suffixActions.length;
    this.suggestions.replace(uniqueSuggestions);
    this.suffixActions = suffixActions;
    this.open = suggestionCount > 0;
    this.suggestionIndex = uniqueSuggestions.length > 0 ? 0 : -1;
    if (this.textValue !== this.searchValue) {
      this.searchValue = this.textValue;
      this.props.onSearch(this.searchValue, this.onReceiveSuggestions);
    }
  }

  @action.bound
  private onKeyDown(e: any) {
    const suggestionCount = this.suggestions.length + this.suffixActions.length;
    switch (e.keyCode) {
      case 40: // DOWN
        if (suggestionCount > 0) {
          e.preventDefault();
          e.stopPropagation();
          let index = this.suggestionIndex + 1;
          if (index >= suggestionCount) {
            index = 0;
          }
          this.suggestionIndex = index;
          this.open = true;
        }
        break;
      case 38: // UP
        if (suggestionCount > 0 && this.open) {
          e.preventDefault();
          e.stopPropagation();
          let index = this.suggestionIndex - 1;
          if (index < 0) {
            index = -1;
          }
          this.suggestionIndex = index;
        }
        break;
      case 13: // RETURN
        this.searchValue = '';
        if (!this.props.suggest) {
          if (this.props.onValueChange) {
            this.props.onValueChange('');
          } else {
            this.value = '';
          }
        }
        if (suggestionCount > 0 && this.suggestionIndex !== -1) {
          if (this.open) {
            this.open = false;
            const item = this.suggestions.concat(this.suffixActions)[this.suggestionIndex];
            this.chooseSuggestion(item);
            e.preventDefault();
            e.stopPropagation();
          }
        }
        break;
      case 8: // BACKSPACE
        {
          // Remove the last chip from the selection.
          if (this.input.selectionStart === 0 && this.input.selectionEnd === 0) {
            this.deleteLastSelectedItem();
          }
        }
        break;
      case 9: // TAB
      case 27: // ESC
      default:
        break;
    }
  }

  private deleteLastSelectedItem() {
    if (this.selection().length > 0) {
      this.updateSelection(this.selection().slice(0, -1));
    }
  }

  private chooseSuggestion(suggestion: S) {
    if (!suggestion) {
      throw new Error('Invalid suggestion.');
    }
    const callback = (s: S) => { this.addToSelection(s); };
    const done = this.props.onChooseSuggestion(suggestion, callback);
    if (!done) {
      this.addToSelection(suggestion);
    }
  }

  private updateSelection(selection: S[]) {
    if (this.props.multiple) {
      this.props.onSelectionChange(selection);
    } else if (selection.length > 0) {
      this.props.onSelectionChange(selection[0]);
    } else {
      this.props.onSelectionChange(null);
    }
  }

  private selection() {
    if (Array.isArray(this.props.selection)) {
      return this.props.selection;
    } else if (this.props.selection === null || this.props.selection === undefined) {
      return [];
    } else {
      return [this.props.selection];
    }
  }

  private get textValue() {
    return this.props.textValue || this.value;
  }
}
