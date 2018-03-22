import * as React from 'react';
import { AttachmentDisplay } from './AttachmentDisplay';

interface Props {
  attachments: string[];
}

/** React component that represents a list of attachments to an issue. */
export class ShowAttachments extends React.Component<Props> {
  public render() {
    return (
      <div className="attachments">
        {this.props.attachments.map(a => (<AttachmentDisplay key={a} fileId={a} />))}
      </div>
    );
  }
}
