import { DocumentNode, visit } from 'graphql';
import graphql, { Resolver } from 'graphql-anywhere';

import { getDirectiveType, nodeHasComputedDirectives } from './directive-utils';
import { difference, isEqual } from './set-utils';
import { AugmentedOperation, Entities } from './types';

function _listDocumentComputedDirectives(doc?: DocumentNode) {
  if (doc == null) {
    return [];
  }

  const computedDirectives = new Set();

  visit(doc, {
    Field(node) {
      if (nodeHasComputedDirectives(node)) {
        const computedDirective = node.directives?.find((d) => d.name.value === 'computed');
        const directiveType = getDirectiveType(computedDirective);
        computedDirectives.add(`${directiveType}:${node.name.value}`);
      }
    },
  });

  return [...computedDirectives];
}

function _documentHasComputedDirectives(doc?: DocumentNode) {
  return _listDocumentComputedDirectives(doc).length > 0;
}

export function resolveData(data: any, operation: AugmentedOperation, entities: Entities) {
  const { mixedQuery, originalQuery } = operation;

  let pendingResolvers = new Set();
  let resolvedResolvers = new Set();

  /*
   * Combine our custom resolvers with the default
   * resolver: (field, root) => root[field]
   */
  const resolver: Resolver = (fieldName, root: _root, _, __, info) => {
    const root = _root == null ? {} : _root;
    const { resultKey } = info; // this is the new field name if we use an alias => resultKey: fieldName
    const { __typename: typeName } = root;

    const aliasValue = root[resultKey];
    const nonAliasValue = root[fieldName];
    const isAliasedField = aliasValue !== nonAliasValue;

    if (aliasValue !== undefined || nonAliasValue !== undefined) {
      return aliasValue || nonAliasValue; // we already computed the value of this field
    }

    const shouldUseEntity = entities[typeName]?.fields[fieldName] != null;
    if (!shouldUseEntity) {
      return isAliasedField ? aliasValue : nonAliasValue;
    }

    const { resolver, dependencies } = entities[typeName]!.fields[fieldName];
    const resolverId = `${typeName}:${fieldName}`;

    if (!_documentHasComputedDirectives(dependencies)) {
      // no dependencies, resolve and add it to resolved resolvers
      resolvedResolvers.add(resolverId);
      return resolver(root);
    }

    const dependentResolvers = _listDocumentComputedDirectives(dependencies);

    if (dependentResolvers.some((d) => !resolvedResolvers.has(d))) {
      // not every dependency has been resolved, add it to pending resolvers and return undefined
      pendingResolvers.add(resolverId);
      return undefined;
    } else {
      // every dependency has been resolved, resolve and add it to resolved resolvers
      resolvedResolvers.add(resolverId);
      return resolver(root);
    }
  };

  let resolvedData = graphql(resolver, mixedQuery, data);
  let prevPendingResolvers = new Set();
  let prevResolvedResolvers = new Set();

  while (pendingResolvers.size > 0) {
    prevResolvedResolvers = resolvedResolvers;
    resolvedData = graphql(resolver, mixedQuery, resolvedData);
    prevPendingResolvers = pendingResolvers;
    pendingResolvers = difference(pendingResolvers, resolvedResolvers);

    if (
      isEqual(prevResolvedResolvers, resolvedResolvers) &&
      isEqual(prevPendingResolvers, pendingResolvers)
    ) {
      // did an entire pass without resolving anything, so probably
      // we're in a situation that cannot be resolved. Just throw an error.
      throw new Error('Irresoluble dependency chain found.');
    }
  }

  return graphql(resolver, originalQuery, resolvedData);
}
