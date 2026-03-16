# Changelog

## 2.1.0

- Verify and test full compatibility with urql v4 and v5
- Fix integration tests for urql v5 (remove `dedupExchange`, update mock fetch, fix `createRequest` call)
- Add `test:integration` and `test:all` npm scripts
- Update README with compatibility table and urql v4 migration notes
- Add keywords to package.json

### Upgrading urql in your project (v3 → v4/v5)

This exchange requires no code changes. However, your **client setup** does:

- **Remove `dedupExchange`** from your `exchanges` array — it's built into the Client in urql v4+.
- **`exchanges` is now required** — urql v4+ no longer provides default exchanges.

```diff
 import {
   createClient,
   cacheExchange,
-  dedupExchange,
   fetchExchange,
 } from 'urql';

 const client = createClient({
   url: '/graphql',
   exchanges: [
-    dedupExchange,
     cacheExchange,
     computedExchange({ entities }),
     fetchExchange,
   ],
 });
```

## 2.0.0

- Zero runtime dependencies (removed `fraql`)
- Dual CJS/ESM build output
- Upgraded all dev tooling (TypeScript 5, Jest 29, ESLint 10)
- Node.js >=16 required
- Published under `@drawbotics` scope to GitHub Packages

### Breaking changes

- Package renamed from `urql-computed-exchange` to `@drawbotics/urql-computed-exchange`
- Minimum Node.js version raised from 10 to 16

## 1.2.0

- Widened peer dependency ranges: `urql ^3 || ^4 || ^5`, `wonka ^5 || ^6`, `graphql ^15 || ^16`

## 1.1.0

- Upgraded dev dependencies to fix all vulnerabilities

## 1.0.2

- Fixed dependency vulnerabilities
- Configured GitHub Packages publishing under `@drawbotics` scope

## 1.0.0

- Initial release
- `computedExchange` — urql exchange for computed GraphQL properties via `@computed` directive
- `createEntity` / `mergeEntities` — define entities with field resolvers and dependencies
- Supports transitive computed dependencies
- Supports field aliases
