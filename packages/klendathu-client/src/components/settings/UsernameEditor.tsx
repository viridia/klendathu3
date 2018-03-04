import * as React from 'react';
import { ControlLabel, FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import { action, autorunAsync, observable } from 'mobx';
import { observer } from 'mobx-react';
import { lookupName } from '../../network/nameRequest';
  // import { db } from '../../firebase';

interface Props {
  initialValue: string;
  value: string;
  onChangeUsername: (value: string) => void;
  onChangeAvailable: (available: boolean) => void;
}

@observer
export class UsernameEditor extends React.Component<Props> {
  @observable private status: 'success' | 'error' | 'warning' | null = null;
  @observable private message: string = null;

  public componentWillMount() {
    this.validateName(this.props.value);
  }

  public render() {
    return (
      <FormGroup id="username-editor" validationState={this.status}>
        <ControlLabel>Username</ControlLabel>
        <FormControl
          value={this.props.value}
          onChange={this.onChange}
          maxLength={32}
          placeholder="Choose a unique identifier for your account"
        />
        <HelpBlock>{this.message || <span>&nbsp;</span>}</HelpBlock>
      </FormGroup>
    );
  }

  @action.bound
  private onChange(e: any) {
    const value: string = e.target.value.toLowerCase();
    this.props.onChangeUsername(value);
    this.validateName(value);
  }

  private validateName(value: string) {
    if (value === this.props.initialValue) {
      this.status = null;
      this.message = null;
      this.props.onChangeAvailable(false);
    } else if (value.length === 0) {
      this.status = 'error';
      this.message = 'Name cannot be blank';
      this.props.onChangeAvailable(false);
    } else if (value.length < 4) {
      this.status = 'error';
      this.message = 'Longer please';
      this.props.onChangeAvailable(false);
    } else if (!value.match(/^[\w\-\.\_]+$/)) {
      this.status = 'error';
      this.message = 'Invalid character';
      this.props.onChangeAvailable(false);
    } else if (!value.match(/^[a-zA-Z]/)) {
      this.status = 'error';
      this.message = 'Name must start with a letter';
      this.props.onChangeAvailable(false);
    } else {
      this.message = 'Checking availability...';
      autorunAsync(() => {
        lookupName(value).then(result => {
          // Make sure value didn't change while data was being loaded.
          if (this.props.value === value) {
            this.props.onChangeAvailable(!result.type);
            if (result.type) {
              this.status = 'error';
              this.message = 'Name is not available';
            } else {
              this.status = 'success';
              this.message = 'Name is available';
            }
          }
        }, error => {
          console.error('Error fetching owner:', name, error);
        });
      }, 10);
    }
  }
}
