import * as React from 'react';
import { Attachment } from 'klendathu-json-types';
import { AttachmentPreview } from './AttachmentPreview';
import { Project } from '../../models';
import { FileDropZone } from './FileDropZone';
import { action } from 'mobx';
import { observer } from 'mobx-react';
// import bind from 'bind-decorator';

import './attachments.scss';

// type AttachmentsMap = Immutable.OrderedMap<string, Attachment>;

interface Props {
  project: Project;
  attachments: Attachment[];
}

/** React component that represents a list of attachments to be uploaded. */
@observer
export class UploadAttachments extends React.Component<Props> {

  public render() {
    const { attachments, project } = this.props;
    return (
      <div className="upload-attachments">
        <div className="files">
          {this.renderFiles()}
        </div>
        <FileDropZone
            project={project}
            fileList={attachments} /*onChangeFiles={this.onChangeFiles}*/
        />
      </div>
    );
  }

  private renderFiles() {
    const { attachments } = this.props;
    return attachments.map(attachment => (
      <AttachmentPreview
          key={attachment.filename}
          attachment={attachment}
          onRemove={this.onRemove}
      />));
  }

  @action.bound
  private onRemove(attachment: Attachment) {
    const { attachments } = this.props;
    const index = attachments.indexOf(attachment);
    if (index >= 0) {
      attachments.splice(index, 1);
    }
  }
}
