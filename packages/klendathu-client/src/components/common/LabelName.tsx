import * as React from 'react';
import { Project } from '../../models';
import { Label } from 'klendathu-json-types';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

import './LabelName.scss';

interface Props {
  label: number;
  project: Project;
}

/** Component that displays a label as a chip. */
@observer
export class LabelName extends React.Component<Props> {
  @observable.ref private label: Label = null;
  private unsubscribe: () => void;

  public componentWillMount() {
    const { project, label } = this.props;
    this.unsubscribe = db
        .collection('database').doc(project.owner)
        .collection('projects').doc(project.id)
        .collection('labels').doc(String(label))
        .onSnapshot({ next: this.onNext, error: this.onError });
  }

  public componentWillUnmount() {
    this.unsubscribe();
  }

  public render() {
    const label = this.label;
    if (label) {
      return (
        <span className="label-name" style={{ backgroundColor: label.color }}>
          {label.name}
        </span>
      );
    } else {
      return <span className="label-name">unknown label</span>;
    }
  }

  @action.bound
  private onNext(record: firebase.firestore.DocumentSnapshot) {
    this.label = record.exists ? record.data() as Label : null;
  }

  @action.bound
  private onError(error: Error) {
    this.label = null;
    console.error('Error loading label:', error);
  }
}
