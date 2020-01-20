import gql from 'fraql';
import { print } from 'graphql';

import { createEntity } from '../create-entity';
import { nodeHasComputedDirectives, replaceDirectivesByFragments } from '../directive-utils';
import { mergeEntities } from '../merge-entities';
import { Entities } from '../types';

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

  describe('replaceDirectivesByFragments', () => {
    let entities: Entities;

    beforeAll(() => {
      interface FooEntity {
        oneField: string;
        fieldWithoutDependencies: string;
      }

      const Foo = createEntity<FooEntity>('Foo', {
        oneField: {
          dependencies: gql`
            fragment _ on Foo {
              id
            }
          `,
          resolver: (foo) => foo.id + 'field',
        },
        fieldWithoutDependencies: {
          resolver: (foo) => foo.id + 'field-no-dependencies',
        },
      });

      entities = mergeEntities(Foo);
    });

    it('throws an error when no type is specified in the directive', () => {
      const query = gql`
        query GetFoo {
          getFoo(id: "id") {
            name
            oneField @computed
          }
        }
      `;

      expect(() => replaceDirectivesByFragments(query, entities)).toThrow(
        /Invalid @computed directive found. No type specified/,
      );
    });

    it('throws an error when an unknown type name is specified in the directive', () => {
      const query = gql`
        query GetFoo {
          getFoo(id: "id") {
            name
            oneField @computed(type: Bar)
          }
        }
      `;

      expect(() => replaceDirectivesByFragments(query, entities)).toThrow(
        /No entity found for type "Bar"/,
      );
    });

    it('throws an error when no resolver is found for the computed directive', () => {
      const query = gql`
        query GetFoo {
          getFoo(id: "id") {
            name
            anotherField @computed(type: Foo)
          }
        }
      `;

      expect(() => replaceDirectivesByFragments(query, entities)).toThrow(
        /No resolver found for @computed directive "anotherField" in type "Foo"/,
      );
    });

    it('replaces the directive by the fragment in dependencies', () => {
      const query = gql`
        query GetFoo {
          getFoo(id: "id") {
            name
            oneField @computed(type: Foo)
          }
        }
      `;

      const expectedQuery = gql`
        query GetFoo {
          getFoo(id: "id") {
            name
            ... on Foo {
              id
            }
          }
        }
      `;

      const result = replaceDirectivesByFragments(query, entities);
      expect(print(result)).toEqual(print(expectedQuery));
    });

    it('just removes the directive when no dependencies are specified', () => {
      const query = gql`
        query GetFoo {
          getFoo(id: "id") {
            name
            fieldWithoutDependencies @computed(type: Foo)
          }
        }
      `;

      const expectedQuery = gql`
        query GetFoo {
          getFoo(id: "id") {
            name
          }
        }
      `;

      const result = replaceDirectivesByFragments(query, entities);
      expect(print(result)).toEqual(print(expectedQuery));
    });
  });

  describe('addFragmentsFromDirectives', () => {});
});
