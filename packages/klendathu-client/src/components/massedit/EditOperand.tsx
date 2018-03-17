import { FieldType } from 'klendathu-json-types';
import { Project, Template, OperandType } from '../../models';
import * as React from 'react';
import { DropdownButton, FormControl, MenuItem } from 'react-bootstrap';
import { UserAutocomplete } from '../common/UserAutocomplete';
import { LabelSelector } from '../issues/input/LabelSelector';
import { EnumSetEditor } from '../issues/input/EnumSetEditor';
import { StateSetEditor } from '../issues/input/StateSetEditor';
import { TypeSetEditor } from '../issues/input/TypeSetEditor';
import { observer } from 'mobx-react';

import './EditOperand.scss';

interface Props {
  type: OperandType;
  value: any;
  project: Project;
  template: Template;
  customField: FieldType;
  onChange: (value: any) => void;
}

/** Component which allows the user to enter a value for the filter and mass edit functions. */
@observer
export class EditOperand extends React.Component<Props> {
  public render() {
    const { type, customField, project, template, onChange, value } = this.props;
    if (!type || value === undefined) {
      return null;
    }
    switch (type) {
      case OperandType.SEARCH_TEXT:
        return (
          <FormControl
              className="match-text"
              placeholder="text to match"
              value={value}
              onChange={(e: any) => onChange(e.target.value)}
          />
        );
      case OperandType.TEXT:
        return (
          <FormControl
              className="match-text"
              placeholder="text to find"
              value={value}
              onChange={(e: any) => onChange(e.target.value)}
          />
        );
      case OperandType.STATE_SET: {
        return <StateSetEditor template={template} value={value} />;
      }
      case OperandType.TYPE_SET: {
        return <TypeSetEditor template={template} value={value} />;
      }
      case OperandType.STATE: {
        const items = template.states.map(st => (
          <MenuItem eventKey={st.id} key={st.id}>{st.caption}</MenuItem>
        ));
        const selectedState = template.states.find(st => st.id === value);
        return (
          <DropdownButton
              bsSize="small"
              title={selectedState ? selectedState.caption : 'Choose state...'}
              id="action-id"
              onSelect={onChange}
          >
            {items}
          </DropdownButton>);
      }
      case OperandType.TYPE: {
        const items = template.types.map(t => (
          !t.abstract && <MenuItem eventKey={t.id} key={t.id}>{t.caption}</MenuItem>
        ));
        const selectedType = template.types.find(t => t.id === value);
        return (
          <DropdownButton
              bsSize="small"
              title={selectedType ? selectedType.caption : 'Choose type...'}
              id="action-id"
              onSelect={onChange}
          >
            {items}
          </DropdownButton>);
      }
      case OperandType.LABEL: {
        return (
          <LabelSelector
              className="labels inline"
              project={project}
              selection={value.slice()}
              onSelectionChange={onChange}
          />);
      }
      case OperandType.USER: {
        return (
          <UserAutocomplete
              className="user inline"
              placeholder="(none)"
              selection={value}
              onSelectionChange={onChange}
          />);
      }
      case OperandType.USERS: {
        return (
          <UserAutocomplete
              className="user inline"
              placeholder="(none)"
              selection={value ? value.slice() : []}
              multiple={true}
              onSelectionChange={onChange}
          />);
      }
      case OperandType.ENUM: {
        return <EnumSetEditor field={customField} value={value} />;
      }
      default:
        return null;
    }
  }
}
