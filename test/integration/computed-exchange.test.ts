import gql from 'fraql';
import { Client, cacheExchange, createClient, dedupExchange, fetchExchange } from 'urql';

import { computedExchange, createEntity } from '../../src';
import { createMockFetch, runQuery } from '../utils';

describe('urql-computed-exchange', () => {
  describe('computed-exchange', () => {
    describe('computedExchange', () => {
      let client: Client;

      beforeAll(() => {
        const entities = {
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
          }),
        };

        client = createClient({
          url: '/graphql',
          fetch: createMockFetch()
            .post('/graphql', {
              status: 200,
              json: async () => {
                return {
                  data: {
                    user: {
                      id: 1,
                      firstName: 'Lorem',
                      lastName: 'Ipsum',
                      __typename: 'User',
                    },
                  },
                };
              },
            })
            .build(),
          exchanges: [dedupExchange, cacheExchange, computedExchange({ entities }), fetchExchange],
        });
      });

      it('runs queries without computed properties', async () => {
        const query = gql`
          query User {
            user(id: "id") {
              id
              firstName
              lastName
            }
          }
        `;

        const { data } = await runQuery(client, query);
        expect(data).toMatchObject({
          user: {
            id: 1,
            firstName: 'Lorem',
            lastName: 'Ipsum',
          },
        });
      });

      it('runs queries with computed properties', async () => {
        const query = gql`
          query User {
            user(id: "id") {
              id
              firstName
              lastName
              fullName @computed(type: User)
            }
          }
        `;

        const { data } = await runQuery(client, query);
        expect(data).toMatchObject({
          user: {
            id: 1,
            firstName: 'Lorem',
            lastName: 'Ipsum',
            fullName: 'Lorem Ipsum',
          },
        });
      });
    });
  });
});
