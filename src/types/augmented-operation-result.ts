import { OperationResult } from 'urql';
import { AugmentedOperation } from './augmented-operation';

export interface AugmentedOperationResult<T = any> extends OperationResult<T> {
  rawData: T;
  operation: AugmentedOperation;
}
