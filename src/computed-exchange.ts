import { map, pipe } from 'wonka';
import { Exchange } from 'urql';

import { replaceDirectivesByFragments, addFragmentsFromDirectives } from './directive-utils';
import { resolveData } from './resolve-data';
import { AugmentedOperation, AugmentedOperationResult, Entities } from './types';

export function computedExchange({ entities }: { entities: Entities }): Exchange {
  return ({ forward }) => (op$) =>
    pipe(
      op$,
      map(
        (op): AugmentedOperation => {
          const { query } = op;
          const augmentedOp: AugmentedOperation = op as AugmentedOperation;

          augmentedOp.originalQuery = query;

          // We need to combine fragments and computed properties
          // otherwise, when we try to resolve, since nothing is calling the
          // nested computed properties, they're never gonna be resolved
          augmentedOp.mixedQuery = addFragmentsFromDirectives(query, entities);
          augmentedOp.query = replaceDirectivesByFragments(query, entities);

          return augmentedOp;
        },
      ),
      forward,
      map((res) => {
        const { data } = res;
        const augmentedRes = res as AugmentedOperationResult;

        augmentedRes.rawData = data;
        augmentedRes.data = resolveData(data, augmentedRes.operation, entities);

        // We need to restore the original query so URQL caches
        // the one with the @computed directives instead of the
        // resolved one.
        augmentedRes.operation.query = augmentedRes.operation.originalQuery;

        return res;
      }),
    );
}
