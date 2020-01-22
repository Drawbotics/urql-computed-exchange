import { Exchange, OperationResult } from 'urql';
import { make, merge, mergeMap, pipe, share } from 'wonka';

export function fetchExchangeMock(value: any): Exchange {
  console.log(value);

  return ({ forward }) => (op$) => {
    const sharedOp$ = share(op$);

    const fetchResult$ = pipe(
      sharedOp$,
      mergeMap((_) => {
        return make<OperationResult>(({ next }) => {
          next(value);
          return () => {};
        });
      }),
    );

    const forward$ = pipe(sharedOp$, forward);

    return merge([fetchResult$, forward$]);
  };
}
