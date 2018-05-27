import * as React from 'react';
import { Button, ControlLabel, Form, FormControl, FormGroup, HelpBlock } from 'react-bootstrap';
import { request, session } from '../../models';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { toast } from 'react-toastify';

import './UserAccountForm.scss';

import * as DefaultAvatar from '../../../icons/default-avatar.png';

@observer
export class UserAccountForm extends React.Component<undefined> {
  @observable private displayName: string;
  @observable private displayNameError: string;
  private fileInput: HTMLInputElement;

  public render() {
    const photoUrl = session.account.photo || DefaultAvatar;
    return (
      <section className="settings-tab-pane">
        <header>
          <span>Account settings for user:&nbsp;</span>
          <b>{session.account.uname}</b>
        </header>
        <section className="user-account-panel">
          <Form className="user-account-form" onSubmit={this.onClickSave}>
            <FormGroup id="display-name-editor">
              <ControlLabel>Name</ControlLabel>
              <FormControl
                  value={this.displayName}
                  onChange={this.onChangeDisplayName}
                  maxLength={64}
                  placeholder="How you want your name to be displayed"
                  autoFocus={true}
              />
              <FormControl.Feedback />
              <HelpBlock>{this.displayNameError}</HelpBlock>
            </FormGroup>
            <footer>
              <Button bsStyle="primary" onClick={this.onClickSave}>
                Save
              </Button>
            </footer>
          </Form>
          <button
              className="photo"
              style={{ backgroundImage: `url(${photoUrl})` }}
              onClick={this.onChangeProfilePhoto}
          >
            {!session.account.photo && <div className="caption">Profile Photo</div>}
          </button>
          <input
              ref={el => { this.fileInput = el; }}
              accept="image/*"
              type="file"
              onChange={this.onFileChange}
              style={{ display: 'none '}}
          />
        </section>
      </section>
    );
  }

  @action.bound
  private onChangeDisplayName(e: any) {
    this.displayName = e.target.value;
  }

  @action.bound
  private onClickSave(e: any) {
    e.preventDefault();
    // this.displayName = e.target.value;
  }

  @action.bound
  private onChangeProfilePhoto(e: any) {
    e.preventDefault();
    this.fileInput.click();
  }

  @action.bound
  private onFileChange(e: any) {
    if (this.fileInput.files.length > 0) {
      this.upload(this.fileInput.files[0]);
    }
    this.fileInput.value = '';
  }

  /** Begin uploading the file, returns a promise. */
  private upload(file: File) {
    const formData = new FormData();
    formData.append('attachment', file);
    return request.post(`/api/photo/${session.account.uid}`, formData, {
      // onUploadProgress: this.onProgress,
    }).then(resp => {
      return request.patch(`/api/accounts/me`, {
        photo: resp.data.url,
      }).then(() => {
        session.reload();
      });
    }, error => {
      toast.error('Upload failed');
      console.error('upload photo error:', error);
    });
  }
}
