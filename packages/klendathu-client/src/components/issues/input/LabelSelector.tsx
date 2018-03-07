// tslint:disable:max-classes-per-file
import bind from 'bind-decorator';
import { Label } from 'klendathu-json-types';
import { Project } from '../../../models';
import * as React from 'react';
import { Autocomplete, SearchCallback } from '../../ac/Autocomplete';
import { Chip } from '../../ac/Chip';
import { LabelDialog  } from '../../labels/LabelDialog';
import { action, observable } from 'mobx';
import { searchLabels } from '../../../network/requests';
import { observer } from 'mobx-react';

import '../../ac/Chip.scss';

interface Props {
  className?: string;
  project: Project;
  selection: Label[];
  onSelectionChange: (selection: Label[]) => void;
}

class AutocompleteLabels extends Autocomplete<Label> {}

@observer
export class LabelSelector extends React.Component<Props> {
  @observable private showModal = false;
  private ac: AutocompleteLabels;
  private token: string;

  public render() {
    return (
      <div className="label-selector">
        {this.showModal && (
          <LabelDialog
              project={this.props.project}
              onHide={this.onCloseModal}
              onInsertLabel={this.onInsertLabel}
          />)}
        <AutocompleteLabels
            {...this.props}
            multiple={true}
            onSearch={this.onSearchLabels}
            onGetValue={this.onGetValue}
            onGetSortKey={this.onGetSortKey}
            onChooseSuggestion={this.onChooseSuggestion}
            onRenderSuggestion={this.onRenderSuggestion}
            onRenderSelection={this.onRenderSelection}
            ref={el => { this.ac = el; }}
        />
      </div>);
  }

  @bind
  private onSearchLabels(token: string, callback: SearchCallback<Label>) {
    const newLabelOption = {
      name: <span>New&hellip;</span>,
      id: '*new*',
    };
    if (token.length === 0) {
      callback([], [newLabelOption]);
    } else {
      const { project } = this.props;
      this.token = token;
      searchLabels(project.account, project.uname, token, labels => {
        if (this.token === token) {
          callback(labels.slice(0, 5), [newLabelOption]);
        }
      });
    }
  }

  @action.bound
  private onChooseSuggestion(label: Label) {
    if (label.id === '*new*' && !label.project) {
      this.showModal = true;
      return true;
    }
    return false;
  }

  @bind
  private onInsertLabel(label: Label) {
    if (label === null || label === undefined) {
      throw new Error('invalid label');
    }
    this.ac.addToSelection(label);
  }

  @bind
  private onRenderSuggestion(label: Label) {
    return <span key={label.id}>{label.name}</span>;
  }

  @bind
  private onRenderSelection(label: Label) {
    return (
      <Chip style={{ backgroundColor: label.color }} key={label.id}>{label.name}</Chip>
    );
  }

  @bind
  private onGetValue(label: Label): string {
    return label.id;
  }

  @bind
  private onGetSortKey(label: Label) {
    return label.name;
  }

  @action.bound
  private onCloseModal() {
    this.showModal = false;
  }
}
