import { DocumentNode } from 'graphql';

interface FieldResolver<T> {
  dependencies?: DocumentNode;
  resolver: (entity: any) => T;
}

export interface Entity<T = any> {
  typeName: string;
  fields: { [K in keyof T]: FieldResolver<T[K]> };
}

export type Entities = Record<string, Entity>;
