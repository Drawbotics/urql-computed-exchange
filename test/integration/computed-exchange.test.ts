import gql from 'fraql';
import {
  Client,
  cacheExchange,
  createClient,
  createRequest,
  dedupExchange,
  fetchExchange,
} from 'urql';
import { pipe, subscribe } from 'wonka';

import { createMockFetch } from '../utils/simple-mock-fetch';

// import { computedExchange } from '../../src/computed-exchange';
// import { createEntity } from '../../src/create-entity';
// import { fetchExchangeMock } from '../utils/fetch-exchange-mock';

// jest.mock('../../src/resolve-data');

describe('urql-computed-exchange', () => {
  describe('computed-exchange', () => {
    describe('computedExchange', () => {
      let client: Client;

      beforeAll(() => {
        // const entities = {
        //   User: createEntity('User', {
        //     fullName: {
        //       dependencies: gql`
        //         fragment _ on User {
        //           firstName
        //           lastName
        //         }
        //       `,
        //       resolver: (user) => `${user.firstName} ${user.lastName}`,
        //     },
        //   }),
        // };

        client = createClient({
          url: '/graphql',
          // fetch: async () => {
          //   return {
          //     status: 200,
          //     json: () => Promise.resolve({ data: { user: { id: 1 } } }),
          //   } as Response;
          // },
          // fetch: createMockFetch().post('/graphql', {
          //   data: { user: { id: 1 }},
          // }).post('/graphql2', (data) => {
          //   if (data) {

          //   }
          // }).get('/my-get', {}),
          fetch: createMockFetch()
            .post('/graphql', {
              status: 200,
              json: () => Promise.resolve({ data: { user: { id: 1 } } }),
            })
            .build(),
          exchanges: [
            dedupExchange,
            cacheExchange,
            // computedExchange({ entities }),
            fetchExchange,
            // fetchExchangeMock({ user: { id: 1 } }),
          ],
        });
      });

      it('', () => {
        const query = gql`
          query User {
            user(id: "id") {
              id
            }
          }
        `;

        return new Promise((done) => {
          const request = createRequest(query);
          pipe(
            client.executeQuery(request),
            subscribe(({ data }) => {
              console.log('data', data);
              done();
            }),
          );
        });

        // const res = await toPromise(client.executeQuery(query));
        // console.log(res);
      });
    });
  });
});
