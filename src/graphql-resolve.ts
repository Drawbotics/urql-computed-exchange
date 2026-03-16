import { DocumentNode, FieldNode, InlineFragmentNode, Kind, SelectionSetNode } from 'graphql';

export interface ResolverInfo {
  isLeaf: boolean;
  resultKey: string;
}

export type Resolver = (
  fieldName: string,
  root: any,
  args: any,
  context: any,
  info: ResolverInfo,
) => any;

function getMainDefinition(document: DocumentNode) {
  for (const definition of document.definitions) {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      return definition;
    }
  }
  for (const definition of document.definitions) {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      return definition;
    }
  }
  throw new Error('No operation or fragment definition found');
}

function resultKeyNameFromField(field: FieldNode): string {
  return field.alias ? field.alias.value : field.name.value;
}

function executeSelectionSet(selectionSet: SelectionSetNode, rootValue: any, resolver: Resolver) {
  const result: Record<string, any> = {};

  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      const fieldName = selection.name.value;
      const resultKey = resultKeyNameFromField(selection);
      const isLeaf = !selection.selectionSet;

      const info: ResolverInfo = { isLeaf, resultKey };
      const fieldResult = resolver(fieldName, rootValue, null, null, info);

      if (fieldResult !== undefined) {
        if (!isLeaf && selection.selectionSet && fieldResult !== null) {
          if (Array.isArray(fieldResult)) {
            result[resultKey] = fieldResult.map((item) =>
              executeSelectionSet(selection.selectionSet!, item, resolver),
            );
          } else {
            result[resultKey] = executeSelectionSet(selection.selectionSet, fieldResult, resolver);
          }
        } else {
          result[resultKey] = fieldResult;
        }
      }
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      const fragment = selection as InlineFragmentNode;
      if (fragment.selectionSet) {
        const fragmentResult = executeSelectionSet(fragment.selectionSet, rootValue, resolver);
        Object.assign(result, fragmentResult);
      }
    }
  }

  return result;
}

export function graphqlResolve(resolver: Resolver, document: DocumentNode, rootValue: any) {
  const mainDefinition = getMainDefinition(document);
  if (!mainDefinition.selectionSet) {
    return {};
  }
  return executeSelectionSet(mainDefinition.selectionSet, rootValue, resolver);
}
