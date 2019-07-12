# URQL Domain Exchange

An [URQL](https://github.com/FormidableLabs/urql) exchange to compute data using resolvers and domain entities.

## Installation

```bash
$ npm i urql-domain-exchange
```

## Usage

First, create your domain entities and their resolvers:

```javascript
// domain.js

const Pokemon = {
  numberOfEvolutions: {
    dependencies: gql`
      fragment _ on Pokemon {
        evolutions {
          id
        }
      }
    `,
    resolver: (pokemon) => {
      return (pokemon.evolutions && pokemon.evolutions.length) || 0;
    },
  },
};

export default {
  Pokemon,
};
```

Then, add it to the list of exchanges in URQL when setting up the client:

```javascript
// client.js

import urqlDomainExchange from 'urql-domain-exchange';
import {
  createClient,
  cacheExchange,
  dedupExchange,
  fetchExchange,
} from 'urql';

import domain from './domain';


const client = createClient({
  url: 'https://graphql-pokemon.now.sh/',
  exchanges: [
    dedupExchange,
    cacheExchange,
    domainExchange({ domain }),
    fetchExchange,
  ],
});

export default client;
```

Finally, use the `@computed` directive when declaring your GraphQL queries:

```javascript
// App.js

import React from 'react';
import { useQuery } from 'urql';
import gql from 'graphql-tag';

const PokemonQuery = gql`
  query PokemonQuery {
    pokemon(name: "charmander") {
      id
      name
      numberOfEvolutions @computed(type: Pokemon)
    }
  }
`;

const App = () => {
  const [ res ] = useQuery({
    query: PokemonQuery,
  });

  if (res.fetching) {
    return 'Loading...';
  }

  return (
    <pre>
      {JSON.stringify(res.data, null, 2)}
    </pre>
  );
};

export default App;
```
