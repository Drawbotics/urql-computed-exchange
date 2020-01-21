import { difference, intersection, isEqual, union } from '../set-utils';

describe('urql-computed-exchange', () => {
  describe('set-utils', () => {
    describe('union', () => {
      it('returns the result of combining the two sets', () => {
        const setA = new Set(['a', 'b', 'c']);
        const setB = new Set(['d', 'e', 'f']);

        expect(union(setA, setB)).toEqual(new Set(['a', 'b', 'c', 'd', 'e', 'f']));
      });
    });
    describe('difference', () => {
      it('returns the items that are not common to the two sets', () => {
        const setA = new Set(['a', 'b', 'c']);
        const setB = new Set(['b', 'c', 'd']);

        expect(difference(setA, setB)).toEqual(new Set(['a', 'd']));
      });
    });
    describe('intersection', () => {
      it('returns the items are common to the two sets', () => {
        const setA = new Set(['a', 'b', 'c']);
        const setB = new Set(['b', 'c', 'd']);

        expect(intersection(setA, setB)).toEqual(new Set(['b', 'c']));
      });
    });
    describe('isEqual', () => {
      it('returns true if the sets are equal', () => {
        const setA = new Set(['a', 'b', 'c']);
        const setB = new Set(['a', 'b', 'c']);

        expect(isEqual(setA, setB)).toBe(true);
      });

      it('returns false if the sets are not equal', () => {
        const setA = new Set(['a', 'b', 'c']);
        const setB = new Set(['a', 'b', 'd']);

        expect(isEqual(setA, setB)).toBe(false);
      });
    });
  });
});
