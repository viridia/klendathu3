import * as classNames from 'classnames';
import * as React from 'react';
import { DropTarget } from 'react-dnd';
import * as ReactDOM from 'react-dom';
import { Column, DraggedColumn } from './Column';
import ColumnEntry from './ColumnEntry';

interface OwnProps {
  columns: Column[];
  isVisible?: boolean;
  onDrop: (id: string, index: number, visible: boolean, makeVisible: boolean) => void;
}

interface Props extends OwnProps {
  isOver?: boolean;
  connectDropTarget: (children: JSX.Element) => JSX.Element;
}

interface State {
  insertionIndex?: number;
}

/** A list of columns (either visible or available) */
class ColumnList extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      insertionIndex: null,
    };
  }

  public drop({ id, isVisible }: DraggedColumn) {
    this.props.onDrop(id, this.state.insertionIndex, isVisible, this.props.isVisible);
  }

  public render() {
    const { columns, isOver, isVisible, connectDropTarget } = this.props;
    const { insertionIndex } = this.state;
    return connectDropTarget(
      <section className={classNames('field-list', { dragOver: isOver })} >
        {columns.map((column, index) =>
          (<li
              key={column.id}
              className={classNames({
                insertBefore: isOver && insertionIndex === 0 && index === 0,
                insertAfter: isOver && insertionIndex === index + 1,
              })}
          >
            <ColumnEntry column={column} isVisible={isVisible} />
          </li>))}
      </section>,
    );
  }
}

export default DropTarget<OwnProps>(
  'column', {
    canDrop(props, monitor) {
      const item = monitor.getItem() as DraggedColumn;
      return item.isVisible || props.isVisible;
    },
    hover(props, monitor, component) {
      if (!monitor.isOver()) {
        component.setState({ insertionIndex: null });
      }
      const pos = monitor.getClientOffset();
      const nodes = ReactDOM.findDOMNode(component).querySelectorAll('li'); // eslint-disable-line
      let index = nodes.length;
      let i = 0;
      for (const node of nodes) {
        if (pos.y < node.offsetTop + (node.offsetHeight / 2)) {
          index = i;
          break;
        }
        i += 1;
      }
      component.setState({ insertionIndex: index });
    },
    drop(props, monitor, component) {
      (component as any).drop(monitor.getItem());
    },
  }, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver() && monitor.canDrop(),
  }),
)(ColumnList);
