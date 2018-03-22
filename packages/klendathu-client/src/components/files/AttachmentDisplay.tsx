import * as classNames from 'classnames';
import { Attachment } from 'klendathu-json-types';
import * as React from 'react';
import { FileIcon } from './FileIcon';
import { getFileInfo } from '../../network/requests';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

interface Props {
  fileId: string;
}

/** React component that renders a single attachment to be uploaded. */
@observer
export class AttachmentDisplay extends React.Component<Props> {
  @observable private attachment: Attachment = null;

  public componentDidMount() {
    getFileInfo(this.props.fileId, attachment => {
      this.attachment = attachment;
    });
  }

  public render() {
    if (!this.attachment) {
      return null;
    }

    return (
      <div className={classNames('issue-attachment loaded')} title={this.attachment.filename}>
        <div className="icon">
          <FileIcon
              type={this.attachment.type}
              filename={this.attachment.filename}
              url={this.attachment.url}
              thumbnail={this.attachment.thumbnail}
          />
        </div>
        <div className="name">{this.attachment.filename}</div>
      </div>
    );
  }
}
