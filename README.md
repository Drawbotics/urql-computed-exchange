# URQL Computed Exchange

An [URQL](https://github.com/FormidableLabs/urql) exchange to compute data using resolvers and entities.

## Compatibility

| Peer dependency | Supported versions |
|---|---|
| `urql` | v3, v4, v5 |
| `graphql` | v15, v16 |
| `wonka` | v5, v6 |

## Installation

This package is published to [GitHub Packages](https://github.com/features/packages) under the `@drawbotics` scope.

### 1. Configure npm to use GitHub Packages for the `@drawbotics` scope

Create or update your project's `.npmrc`:

```
@drawbotics:registry=https://npm.pkg.github.com
```

### 2. Authenticate with GitHub Packages

You need a [GitHub personal access token](https://github.com/settings/tokens) with `read:packages` scope. Add it to your `~/.npmrc`:

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

### 3. Install

```bash
npm install @drawbotics/urql-computed-exchange
```

### Migrating from npm

If you were previously using `urql-computed-exchange` from npm, update your imports:

```diff
- import { createEntity, mergeEntities, computedExchange } from 'urql-computed-exchange';
+ import { createEntity, mergeEntities, computedExchange } from '@drawbotics/urql-computed-exchange';
```

## Usage

First, create your entities and their resolvers:

```javascript
// entities.js
import { createEntity, mergeEntities } from '@drawbotics/urql-computed-exchange';

const Pokemon = createEntity('Pokemon', {
  numberOfEvolutions: {
    dependencies: gql`
      fragment _ on Pokemon {
        evolutions {
          id
        }
      }
    `,
    resolver: (pokemon) => {
      return (pokemon.evolutions && pokemon.evolutions.length) ?? 0;
    },
  },
});

export default mergeEntities(Pokemon);
```

Then, add it to the list of exchanges in URQL when setting up the client:

```javascript
// client.js

import { computedExchange } from '@drawbotics/urql-computed-exchange';
import {
  createClient,
  cacheExchange,
  fetchExchange,
} from 'urql';

import entities from './entities';


const client = createClient({
  url: 'https://graphql-pokemon.now.sh/',
  exchanges: [
    cacheExchange,
    computedExchange({ entities }),
    fetchExchange,
  ],
});

export default client;
```

> **Note:** If you're migrating from urql v3, remove `dedupExchange` from your exchanges array — it's now built into the Client in urql v4+.

Finally, use the `@computed` directive when declaring your GraphQL queries. Don't forget to indicate the corresponding `type`:

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
