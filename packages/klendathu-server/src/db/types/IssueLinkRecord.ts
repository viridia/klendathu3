import { Relation } from 'klendathu-json-types';

export interface IssueLinkRecord {
  id?: string;
  from: string;
  to: string;
  relation: Relation;
}
