import gql from 'fraql';
import { AugmentedOperation } from 'src/types';

import { resolveData } from '../resolve-data';

describe('urql-computed-exchange', () => {
  describe('resolve-data', () => {
    describe('resolveData', () => {
      let originalQuery: any;
      let mixedQuery: any;
      let returnedData: any;
      let entities: any;

      beforeAll(() => {
        originalQuery = gql`
          query GetUser {
            user(id: "id") {
              id
              fullName @computed(type: User)
              fullInfo @computed(type: User)
            }
          }
        `;

        mixedQuery = gql`
          query GetUser {
            user(id: "id") {
              id
              fullName @computed(type: User)
              ... on User {
                firstName
                lastName
              }
              fullInfo @computed(type: User)
              ... on User {
                firstName
                lastName
                age
              }
            }
          }
        `;

        returnedData = {
          user: {
            id: 1,
            firstName: 'Lorem',
            lastName: 'Ipsum',
            group: {
              id: 1,
              name: 'Group 1',
              __typename: 'Group',
            },
            __typename: 'User',
          },
        };

        entities = {
          User: {
            typeName: 'User',
            fields: {
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
                resolver: (user: any) => `${user.groupId}:${user.fullName}`,
              },
            },
          },
        };
      });

      it('resolves computed properties', () => {
        const op = { mixedQuery, originalQuery } as AugmentedOperation;
        const result = resolveData(returnedData, op, entities);
        expect(result).toHaveProperty('user.fullName', 'Lorem Ipsum');
      });

      it('resolves correctly computed properties that depend on other computed properties', () => {});

      it('works with queries without computed properties', () => {});

      it('works with aliased fields', () => {});
    });
  });
});
