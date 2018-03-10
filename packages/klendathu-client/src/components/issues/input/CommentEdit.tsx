import bind from 'bind-decorator';
import * as React from 'react';
import { Button, FormControl } from 'react-bootstrap';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

import './CommentEdit.scss';

interface Props {
  disabled: boolean;
  onAddComment: (body: string) => void;
}

@observer
export class CommentEdit extends React.Component<Props> {
  @observable private newComment = '';

  public render() {
    const { disabled } = this.props;
    return (
      <section className="comment-compose">
        <FormControl
            className="comment-entry"
            componentClass="textarea"
            disabled={disabled}
            value={this.newComment}
            placeholder="Leave a comment... (markdown format supported)"
            onChange={this.onChangeCommentBody}
        />
        <Button
            title="add comment"
            disabled={disabled || this.newComment.length === 0}
            onClick={this.onAddComment}
        >
          Comment
        </Button>
      </section>
    );
  }

  @bind
  private onChangeCommentBody(e: any) {
    this.newComment = e.target.value;
  }

  @bind
  private onAddComment() {
    this.props.onAddComment(this.newComment);
    this.newComment = '';
  }
}
