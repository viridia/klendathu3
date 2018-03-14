import { FieldType } from 'klendathu-json-types';
import { ObservableSet } from './ObservableSet';
import { Template } from './Template';

export function defaultValueForType(template: Template, type: string, customField: FieldType): any {
  if (type === 'stateSet') {
    return new ObservableSet(template.states.filter(st => !st.closed).map(st => st.id));
  } else if (type === 'typeSet') {
    return new ObservableSet(template.types.filter(t => !t.abstract).map(t => t.id));
  } else if (type === 'label') {
    return [];
  } else if (type === 'user') {
    return null;
  } else if (type === 'users') {
    return [];
  } else if (type === 'enum') {
    return new ObservableSet(customField.values);
  } else {
    return '';
  }
}
