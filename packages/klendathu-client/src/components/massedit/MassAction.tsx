import * as React from 'react';
import { Account, FieldType, IssueEdit } from 'klendathu-json-types';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { defaultOperandValue, Project, OperandType } from '../../models';
import { EditOperand } from './EditOperand';
import { observer } from 'mobx-react';
import bind from 'bind-decorator';

import CloseIcon from '../../../icons/ic_close.svg';

interface ActionType {
  id: string;
  caption: string;
  type: OperandType;
  apply: (update: Partial<IssueEdit>, value: any) => void;
  customField?: FieldType;
}

export interface EditAction extends ActionType {
  value: any;
}

interface Props {
  index?: number;
  action?: EditAction;
  project: Project;
  onChange: (index: number, action: EditAction & ActionType) => void;
  onRemove: (index: number) => void;
}

@observer
export class MassAction extends React.Component<Props> {
  private static ACTION_TYPES: ActionType[] = [
    {
      id: 'addLabel',
      caption: 'Add Label',
      type: OperandType.LABEL,
      apply: (update: Partial<IssueEdit>, value: string[]) => {
        update.addLabels = [].concat(update.addLabels || [], value.slice());
      },
    },
    {
      id: 'removeLabel',
      caption: 'Remove Label',
      type: OperandType.LABEL,
      apply: (update: Partial<IssueEdit>, value: string[]) => {
        update.removeLabels = [].concat(update.removeLabels || [], value.slice());
      },
    },
    {
      id: 'state',
      caption: 'Change State',
      type: OperandType.STATE,
      apply: (update: Partial<IssueEdit>, value: string) => {
        update.state = value;
      },
    },
    {
      id: 'type',
      caption: 'Change Type',
      type: OperandType.TYPE,
      apply: (update: Partial<IssueEdit>, value: string) => {
        update.type = value;
      },
    },
    {
      id: 'owner',
      caption: 'Change Owner',
      type: OperandType.USER,
      apply: (update: Partial<IssueEdit>, value: Account) => {
        const user = value ? value.uid : null;
        update.owner = user;
      },
    },
    {
      id: 'addCC',
      caption: 'Add CC',
      type: OperandType.USERS,
      apply: (update: Partial<IssueEdit>, value: Account[]) => {
        update.addCC = value.map(l => l.uid);
        return true;
      },
    },
    {
      id: 'removeCC',
      caption: 'Remove CC',
      type: OperandType.USERS,
      apply: (update: Partial<IssueEdit>, value: Account[]) => {
        update.removeCC = value.map(l => l.uid);
      },
    },
    {
      id: 'delete',
      caption: 'Delete',
      type: null,
      // action: 'delete',
      apply: () => {/* */},
    },
  ];

  public render() {
    const { index, action, project } = this.props;
    const items: JSX.Element[] = [];
    MassAction.ACTION_TYPES.forEach(at => {
      items.push(<MenuItem eventKey={at.id} key={at.id}>{at.caption}</MenuItem>);
    });
    const caption = (action && action.caption) || 'Choose action...';

    return (
      <section className="mass-action">
        <DropdownButton
            bsSize="small"
            title={caption}
            id="action-id"
            onSelect={this.onSelectActionType}
        >
          {items}
        </DropdownButton>
        <section className="action-operand">
          {action && (<EditOperand
              type={action.type}
              value={action.value}
              customField={action.customField}
              project={project}
              template={project.template}
              onChange={this.onChangeValue}
          />)}
        </section>
        {index !== undefined &&
          <button className="remove" onClick={this.onRemove}><CloseIcon /></button>}
    </section>
    );
  }

  // renderOpValue() {
  //   return null;
  // }

  @bind
  private onSelectActionType(id: any) {
    const { index, action, onChange, project } = this.props;
    const newAction = MassAction.ACTION_TYPES.find(actionType => actionType.id === id);
    if (!action || newAction.type !== action.type) {
      onChange(index, {
        ...newAction,
        value: defaultOperandValue(project.template, newAction.type, newAction.customField),
      });
    // } else {
    //   onChange(index, { ...newAction, value: action.value });
    }
  }

  @bind
  private onChangeValue(value: any) {
    const { action } = this.props;
    action.value = value;
    // onChange(index, { ...action, value });
  }

  @bind
  private onRemove(e: any) {
    e.preventDefault();
    const { index, onRemove } = this.props;
    onRemove(index);
  }
}
