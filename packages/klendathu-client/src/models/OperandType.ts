import { FieldType } from 'klendathu-json-types';
import { ObservableSet } from './ObservableSet';
import { Template } from './Template';

export enum OperandType {
  STATE = 'state',
  TYPE = 'type',
  STATE_SET = 'stateSet',
  TYPE_SET = 'typeSet',
  LABEL = 'label',
  USER = 'user',
  USERS = 'users',
  ENUM = 'enum',
  TEXT = 'text', // Exact match
  SEARCH_TEXT = 'searchText',
}

export function defaultOperandValue(
    template: Template,
    type: OperandType,
    customField: FieldType): any {
  if (type === OperandType.STATE_SET) {
    return new ObservableSet(template.states.filter(st => !st.closed).map(st => st.id));
  } else if (type === OperandType.TYPE_SET) {
    return new ObservableSet(template.types.filter(t => !t.abstract).map(t => t.id));
  } else if (type === OperandType.LABEL) {
    return [];
  } else if (type === OperandType.USER) {
    return null;
  } else if (type === OperandType.USERS) {
    return [];
  } else if (type === OperandType.ENUM) {
    return new ObservableSet(customField.values);
  } else {
    return '';
  }
}
