import { Predicate } from 'klendathu-json-types';
import { FilterTermDescriptor } from './FilterTermDescriptor';

export interface FilterTerm {
  descriptor: FilterTermDescriptor;
  fieldId: string;
  value: any;
  predicate?: Predicate;
}
