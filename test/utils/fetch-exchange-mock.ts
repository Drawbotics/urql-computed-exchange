import { Exchange, Operation, OperationResult, makeResult } from 'urql';
import { filter, make, merge, mergeMap, pipe, share } from 'wonka';

export function fetchExchangeMock(value: any): Exchange {
  console.log(value);

  const isOperationFetchable = (operation: Operation) => {
    const { operationName } = operation;
    return operationName === 'query' || operationName === 'mutation';
  };

  return ({ forward }) => (op$) => {
    const sharedOp$ = share(op$);

    const fetchResult$ = pipe(
      sharedOp$,
      filter(isOperationFetchable),
      mergeMap((operation) => {
        return make<OperationResult>(({ next, complete }) => {
          console.log(makeResult(operation, { data: value }));
          next(makeResult(operation, { data: value }));
          console.log('complete');
          complete();
          return () => {};
        });
      }),
    );

    const forward$ = pipe(
      sharedOp$,
      filter((op) => !isOperationFetchable(op)),
      forward,
    );

    return merge([fetchResult$, forward$]);
  };
}
