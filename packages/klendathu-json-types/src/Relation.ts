/** Enumeration representing relationship between linked issues. */
export enum Relation {
  BLOCKED_BY = 'BLOCKED_BY',
  BLOCKS = 'BLOCKS',
  PART_OF = 'PART_OF',
  HAS_PART = 'HAS_PART',
  DUPLICATE = 'DUPLICATE',
  RELATED = 'RELATED',
}

export const inverseRelations: { [fwd: string]: Relation } = {
  [Relation.BLOCKED_BY]: Relation.BLOCKS,
  [Relation.BLOCKS]: Relation.BLOCKED_BY,
  [Relation.PART_OF]: Relation.HAS_PART,
  [Relation.HAS_PART]: Relation.PART_OF,
  [Relation.RELATED]: Relation.RELATED,
  [Relation.DUPLICATE]: Relation.DUPLICATE,
};
