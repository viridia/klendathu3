export type Comparator<T> = (a: T, b: T) => number;

/** Given an array of comparators, return a comparator function that works by applying
    each of the input functions in order until one produces a non-zero result. */
export function orderBy<T>(comparators: Array<Comparator<T>>): Comparator<T> {
  return (a: T, b: T) => {
    for (const cmp of comparators) {
      const result = cmp(a, b);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  };
}
