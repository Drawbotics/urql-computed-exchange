import { Operation } from 'urql';
import { DocumentNode } from 'graphql';

export interface AugmentedOperation extends Operation {
  originalQuery: DocumentNode;
  mixedQuery: DocumentNode;
}
