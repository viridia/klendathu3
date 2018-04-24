import * as classNames from 'classnames';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Column } from './Column';
import { ColumnEntry } from './ColumnEntry';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import bind from 'bind-decorator';

interface Props {
  columns: Column[];
  isVisible?: boolean;
  onDrop: (id: string, index: number, visible: boolean, makeVisible: boolean) => void;
}

/** A list of columns (either visible or available) */
@observer
export class ColumnList extends React.Component<Props> {
  @observable private insertionIndex: number = null;
  @observable private isOver: boolean = false;

  public render() {
    const { columns, isVisible } = this.props;
    return (
      <section
          className={classNames('field-list', { dragOver: this.isOver })}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDrop={this.onDrop}
      >
        {columns.map((column, index) =>
          (<li
              key={column.id}
              className={classNames({
                insertBefore: this.isOver && this.insertionIndex === 0 && index === 0,
                insertAfter: this.isOver && this.insertionIndex === index + 1,
              })}
          >
            <ColumnEntry column={column} isVisible={isVisible} />
          </li>))}
      </section>
    );
  }

  @action.bound
  private onDragOver(e: React.DragEvent<any>) {
    for (const type of e.dataTransfer.types) {
      if (type.startsWith('column/')) {
        const [, , visible] = type.split('/');
        const isVisible = visible === 'true';
        this.isOver = isVisible || this.props.isVisible;
        if (this.isOver) {
          e.preventDefault();
        }
        const el = ReactDOM.findDOMNode(this) as HTMLElement;
        const nodes = el.querySelectorAll('li');
        let index = nodes.length;
        let i = 0;
        const pos = e.clientY;
        for (const node of nodes) {
          if (pos < node.offsetTop + (node.offsetHeight / 2)) {
            index = i;
            break;
          }
          i += 1;
        }
        this.insertionIndex = index;
      }
    }
  }

  @bind
  private onDragLeave(e: React.DragEvent<any>) {
    this.isOver = false;
  }

  @bind
  private onDrop(e: React.DragEvent<any>) {
    e.preventDefault();
    this.isOver = false;
    for (const type of e.dataTransfer.types) {
      if (type.startsWith('column/')) {
        const [, id, visible] = type.split('/');
        const isVisible = visible === 'true';
        this.props.onDrop(id, this.insertionIndex, isVisible, this.props.isVisible);
      }
    }
  }
}
