import bind from 'bind-decorator';
import * as classNames from 'classnames';
import { Attachment } from 'klendathu-json-types';
import CloseIcon from '../../../icons/ic_close.svg';
import * as React from 'react';
import { ProgressBar } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FileIcon } from './FileIcon';
import { UploadableFile } from './UploadableFile';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

interface Props {
  attachment: Attachment;
  onRemove: (attachment: Attachment) => void;
}

/** React component that renders a single attachment to be uploaded. */
@observer
export class AttachmentPreview extends React.Component<Props> {
  @observable private style = 'success';
  @observable private loaded = false;

  constructor(props: Props, context: any) {
    super(props, context);
    this.loaded = !!props.attachment.url;
  }

  public componentDidMount() {
    if (!this.props.attachment.url) {
      (this.props.attachment as UploadableFile).upload().then(data => {
        if (data) {
          this.loaded = true;
        }
      }, error => {
        this.style = 'danger';
        toast.error('Upload failed');
        console.error('post file error:', error);
      });
    }
  }

  public render() {
    const { type, filename, url, thumbnail } = this.props.attachment;
    let progress = 0;
    if (!this.props.attachment.url) {
      progress = (this.props.attachment as UploadableFile).progressPercent;
    }

    return (
      <div
          className={classNames('issue-attachment', { loaded: this.loaded })}
          title={filename}
      >
        <div className="icon">
          <button className="close" onClick={this.onRemove}><CloseIcon /></button>
          <FileIcon type={type} filename={filename} url={url} thumbnail={thumbnail} />
        </div>
        <div className="name">{filename}</div>
        <ProgressBar striped={true} bsStyle={this.style} now={progress} />
      </div>
    );
  }

  @bind
  private onRemove(e: any) {
    e.preventDefault();
    this.props.onRemove(this.props.attachment);
  }
}
