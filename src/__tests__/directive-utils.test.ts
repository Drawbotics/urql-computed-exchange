import { nodeHasComputedDirectives } from '../directive-utils';

describe('urql-computed-exchange', () => {
  describe('nodeHasComputedDirectives', () => {
    it('returns true when the node has computed directives', () => {
      const result = nodeHasComputedDirectives({
        directives: [{ name: { value: 'computed' } }],
      } as any);
      expect(result).toBe(true);
    });

    it('returns false when the node is null', () => {
      const result = nodeHasComputedDirectives(undefined);
      expect(result).toBe(false);
    });

    it('returns false when the node does not have directives', () => {
      const result = nodeHasComputedDirectives({} as any);
      expect(result).toBe(false);
    });

    it('returns false when the node does not have computed directives', () => {
      const result = nodeHasComputedDirectives({
        directives: [{ name: { value: 'another-directive' } }],
      } as any);
      expect(result).toBe(false);
    });
  });

  describe('replaceDirectivesByFragments', () => {});

  describe('addFragmentsFromDirectives', () => {});
});
