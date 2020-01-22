import { DocumentNode } from 'graphql';
import { Client, OperationResult, createRequest } from 'urql';
import { pipe, subscribe } from 'wonka';

export function runQuery(client: Client, query: string | DocumentNode) {
  const request = createRequest(query);
  return new Promise<OperationResult>((resolve) => {
    pipe(
      client.executeQuery(request),
      subscribe((res) => {
        resolve(res);
      }),
    );
  });
}
