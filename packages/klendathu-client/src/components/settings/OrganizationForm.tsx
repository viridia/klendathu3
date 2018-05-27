import * as React from 'react';
import { ControlLabel, Form, FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import { session } from '../../models';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

// import './UserAccountForm.scss';

@observer
export class OrganizationForm extends React.Component<undefined> {
  @observable private displayName: string;
  @observable private displayNameError: string;

  public render() {
    return (
      <section className="settings-tab-pane">
        <header>
          <span>Organizations for user:&nbsp;</span>
          <b>{session.account.uname}</b>
        </header>
        <section className="org-settings-panels">
          <Form className="org-account-form">
            <FormGroup id="display-name-editor">
              <ControlLabel>Organization Name</ControlLabel>
              <FormControl
                  value={this.displayName}
                  onChange={this.onChangeDisplayName}
                  maxLength={64}
                  autoFocus={true}
              />
              <FormControl.Feedback />
              <HelpBlock>{this.displayNameError}</HelpBlock>
            </FormGroup>
          </Form>
          <section className="org-list">
            Orgs
          </section>
        </section>
      </section>
    );
  }

  @action.bound
  private onChangeDisplayName(e: any) {
    this.displayName = e.target.value;
  }
}
