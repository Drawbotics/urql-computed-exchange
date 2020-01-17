import { Entity } from 'src/types';

import { mergeEntities } from '../merge-entities';

describe('urql-computed-exchange', () => {
  describe('mergeEntities', () => {
    let consoleError: Console['error'];

    beforeEach(() => {
      consoleError = console.error;
      console.error = () => null;
    });

    afterEach(() => {
      console.error = consoleError;
    });

    it('throws an error when receving entities without a name', () => {
      expect(() => mergeEntities({} as Entity)).toThrowError(/No typeName found for entity/);
    });

    it('creates the entities object', () => {
      const Foo = {
        typeName: 'Foo',
      } as Entity;

      const Bar = {
        typeName: 'Bar',
      } as Entity;

      const result = mergeEntities(Foo, Bar);

      expect(result).toMatchObject({
        Foo: { typeName: 'Foo' },
        Bar: { typeName: 'Bar' },
      });
    });

    it('merges the fields of entities with the same "typeName"', () => {
      const resolver = () => null;

      const Foo = {
        typeName: 'Foo',
        fields: { oneField: { resolver } },
      };

      const Foo2 = {
        typeName: 'Foo',
        fields: { anotherField: { resolver } },
      };

      const result = mergeEntities(Foo, Foo2);

      expect(result).toMatchObject({
        Foo: {
          typeName: 'Foo',
          fields: {
            oneField: { resolver },
            anotherField: { resolver },
          },
        },
      });
    });

    it('throws an error when entities with the same "typeName" have the same fields', () => {
      const resolver = () => null;

      const Foo = {
        typeName: 'Foo',
        fields: { oneField: { resolver } },
      };

      const Foo2 = {
        typeName: 'Foo',
        fields: { oneField: { resolver } },
      };

      expect(() => mergeEntities(Foo, Foo2)).toThrow(
        /Duplicated key "oneField" found when merging entities of type "Foo"/,
      );
    });
  });
});
