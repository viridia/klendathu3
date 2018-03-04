import { Relation } from 'klendathu-json-types';

export const relationNames: { [relation: string]: string } = {
  [Relation.BLOCKED_BY]: 'blocked by',
  [Relation.BLOCKS]: 'blocks',
  [Relation.DUPLICATE]: 'duplicates',
  [Relation.RELATED]: 'related to',
  [Relation.PART_OF]: 'included by',
  [Relation.HAS_PART]: 'includes',
};
