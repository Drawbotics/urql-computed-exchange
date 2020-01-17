import { Entity } from './types';

export function createEntity<T = any>(
  typeName: Entity<T>['typeName'],
  fields: Entity<T>['fields'],
): Entity<T> {
  return { typeName, fields };
}
