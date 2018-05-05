import * as React from 'react';
import * as copy from 'copy-to-clipboard';
import { Button } from 'react-bootstrap';
import bind from 'bind-decorator';

import LinkIcon from '../../../icons/ic_link.svg';

interface Props {
  url: string;
  title?: string;
}

export class CopyLink extends React.Component<Props> {
  public render() {
    const { title } = this.props;
    return (
      <Button
          bsStyle="default"
          className="copy-link"
          title={title || 'Copy link to clipboard'}
          onClick={this.onClick}
      >
        <LinkIcon />
      </Button>
    );
  }

  @bind
  private onClick(e: any) {
    e.preventDefault();
    copy(this.props.url);
  }
}
