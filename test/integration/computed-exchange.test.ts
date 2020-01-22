import gql from 'fraql';
import { Client, cacheExchange, createClient, dedupExchange } from 'urql';
import { toPromise } from 'wonka';

// import { computedExchange } from '../../src/computed-exchange';
// import { createEntity } from '../../src/create-entity';
import { fetchExchangeMock } from '../utils/fetch-exchange-mock';

jest.mock('../../src/resolve-data');

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
          url: '',
          exchanges: [
            dedupExchange,
            cacheExchange,
            // computedExchange({ entities }),
            fetchExchangeMock(''),
          ],
        });
      });

      it('', async () => {
        const query = gql`
          query User {
            user(id: "id") {
              id
            }
          }
        `;

        const res = await toPromise(client.executeQuery(query));
        console.log(res);
      });
    });
  });
});
