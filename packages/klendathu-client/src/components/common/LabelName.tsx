import * as React from 'react';
import { labels, ObservableLabel } from '../../models';
import { observer } from 'mobx-react';

import './LabelName.scss';

interface Props {
  label: string;
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
    if (label.loaded) {
      if (label.name) {
        return (
          <span className="label-name" style={{ backgroundColor: label.color }}>
            {label.name}
          </span>
        );
      } else {
        return <span className="label-name missing">unknown-label</span>;
      }
    } else {
      return null;
    }
  }
}
