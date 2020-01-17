import { createEntity } from '../create-entity';

describe('urql-computed-exchange', () => {
  describe('createEntity', () => {
    it('returns a valid entity', () => {
      const result = createEntity('Foo', { oneField: {} } as any);
      expect(result).toMatchObject({
        typeName: 'Foo',
        fields: { oneField: {} },
      });
    });
  });
});
