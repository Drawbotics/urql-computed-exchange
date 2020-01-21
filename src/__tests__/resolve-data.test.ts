import gql from 'fraql';
import { AugmentedOperation } from 'src/types';

import { createEntity } from '../create-entity';
import { addFragmentsFromDirectives } from '../directive-utils';
import { resolveData } from '../resolve-data';

describe('urql-computed-exchange', () => {
  describe('resolve-data', () => {
    describe('resolveData', () => {
      let originalQuery: any;
      let mixedQuery: any;
      let returnedData: any;
      let entities: any;

      beforeAll(() => {
        entities = {
          User: createEntity('User', {
            fullName: {
              dependencies: gql`
                fragment _ on User {
                  firstName
                  lastName
                }
              `,
              resolver: (user: any) => `${user.firstName} ${user.lastName}`,
            },
            groupId: {
              dependencies: gql`
                fragment _ on User {
                  group {
                    id
                    name
                  }
                }
              `,
              resolver: (user: any) => `${user.group.name}:${user.group.id}`,
            },
            fullInfo: {
              dependencies: gql`
                fragment _ on User {
                  groupId @computed(type: User)
                  fullName @computed(type: User)
                }
              `,
              resolver: (user: any) => `${user.groupId} - ${user.fullName}`,
            },
          }),
        };

        originalQuery = gql`
          query GetUser {
            user(id: "id") {
              id
              id2: id
              fullName @computed(type: User)
              fullInfo @computed(type: User)
              fullName2: fullName @computed(type: User)
              __typename
            }
          }
        `;

        mixedQuery = addFragmentsFromDirectives(originalQuery, entities);

        returnedData = {
          user: {
            id: 1,
            firstName: 'Lorem',
            lastName: 'Ipsum',
            group: {
              id: 1,
              name: 'Group',
              __typename: 'Group',
            },
            __typename: 'User',
          },
        };
      });

      it('resolves computed properties', () => {
        const op = { mixedQuery, originalQuery } as AugmentedOperation;
        const result = resolveData(returnedData, op, entities);
        expect(result).toHaveProperty('user.fullName', 'Lorem Ipsum');
      });

      it('resolves correctly computed properties that depend on other computed properties', () => {
        const op = { mixedQuery, originalQuery } as AugmentedOperation;
        const result = resolveData(returnedData, op, entities);
        expect(result).toHaveProperty('user.fullInfo', 'Group:1 - Lorem Ipsum');
      });

      it('works with aliased fields', () => {
        const op = { mixedQuery, originalQuery } as AugmentedOperation;
        const result = resolveData(returnedData, op, entities);
        expect(result).toHaveProperty('user.id2', 1);
        expect(result).toHaveProperty('user.fullName2', 'Lorem Ipsum');
      });

      it('works with queries without computed properties', () => {
        const originalQuery = gql`
          query GetUser {
            user {
              id
            }
          }
        `;

        const mixedQuery = addFragmentsFromDirectives(originalQuery, entities);

        const op = { mixedQuery, originalQuery } as AugmentedOperation;
        const result = resolveData(returnedData, op, entities);
        expect(result).toHaveProperty('user.id', 1);
      });
    });
  });
});
