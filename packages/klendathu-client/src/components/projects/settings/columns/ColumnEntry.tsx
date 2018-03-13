import * as React from 'react';
import { DragSource } from 'react-dnd';
import { Column } from './Column';

interface Props {
  column: Column;
  isDragging?: boolean;
  isVisible: boolean;
  connectDragSource: (children: any) => any;
}

/** A single entry in the list of columns */
function ColumnEntry({ column, isDragging, connectDragSource }: Props) {
  return connectDragSource(<div style={{ opacity: isDragging ? 0.5 : 1.0 }}>{column.title}</div>);
}

export default DragSource<{ column: Column; isVisible?: boolean; }>(
  'column', {
    beginDrag({ column, isVisible }) {
      return { id: column.id, isVisible };
    },
  }, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }),
)(ColumnEntry);
