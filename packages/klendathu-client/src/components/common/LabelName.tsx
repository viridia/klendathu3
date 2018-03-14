import * as React from 'react';
import { labels, ObservableLabel } from '../../models';
import { observer } from 'mobx-react';
import * as classNames from 'classnames';

import './LabelName.scss';

interface Props {
  label: string;
  className?: string;
  textOnly?: boolean;
}

/** Component that displays a label as a chip. */
@observer
export class LabelName extends React.Component<Props> {
  private label: ObservableLabel = null;

  public componentWillMount() {
    const { label } = this.props;
    this.label = labels.get(label);
  }

  public componentWillUnmount() {
    this.label.release();
  }

  public render() {
    const label = this.label;
    const { className, textOnly } = this.props;
    if (label.loaded) {
      if (label.name) {
        if (textOnly) {
          return <span>{label.name}</span>;
        }
        return (
          <span
              className={classNames('label-name', className)}
              style={{ backgroundColor: label.color }}
          >
            {label.name}
          </span>
        );
      } else {
        if (textOnly) {
          return <span>unknown-label</span>;
        }
        return (
          <span className={classNames('label-name missing', className)}>
            unknown-label
          </span>);
      }
    } else {
      return null;
    }
  }
}
