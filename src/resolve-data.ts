import { visit } from 'graphql';
import graphql from 'graphql-anywhere';

import { nodeHasComputedDirectives } from './directive-utils';

function _listDocumentComputedDirectives(doc) {
  const computedDirectives = new Set();

  visit(doc, {
    Field(node) {
      if (nodeHasComputedDirectives(node)) {
        const computedDirective = node.directives.find((d) => d.name.value === 'computed');
        const directiveType = computedDirective.arguments[0].value.value;
        computedDirectives.add(`${directiveType}:${node.name.value}`);
      }
    },
  });

  return [...computedDirectives];
}

function _documentHasComputedDirectives(doc) {
  return _listDocumentComputedDirectives(doc).length > 0;
}

export function resolveData(data, operation, entities) {
  const { mixedQuery, originalQuery } = operation;

  let pendingResolvers = new Set();
  let resolvedResolvers = new Set();
  let justResolvedResolvers = new Set();

  /*
   * Combine our custom resolvers with the default
   * resolver: (field, root) => root[field]
   */
  const resolver = (fieldName, root = {}, args, context, info) => {
    const { resultKey } = info; // this is the new field name if we use an alias => resultKey: fieldName
    const { __typename: typeName } = root;

    const aliasValue = root[resultKey];
    const nonAliasValue = root[fieldName];
    const isAliasedField = aliasValue !== nonAliasValue;

    if (aliasValue !== undefined || nonAliasValue !== undefined) {
      return aliasValue || nonAliasValue; // we already computed the value of this field
    }

    const shouldUseEntity = entities[typeName] != null && entities[typeName][fieldName] != null;
    if (!shouldUseEntity) {
      return isAliasedField ? aliasValue : nonAliasValue;
    }

    const { resolver, dependencies } = entities[typeName][fieldName];
    const resolverId = `${typeName}:${fieldName}`;

    if (!_documentHasComputedDirectives(dependencies)) {
      // no dependencies
      // resolve and add it to just resolved resolvers
      justResolvedResolvers.add(resolverId);
      return resolver(root);
    }

    const dependentResolvers = _listDocumentComputedDirectives(dependencies);

    // TODO: Find a way to spot circular dependencies
    // TODO: Add support for reducers that return a function

    if (dependentResolvers.some((d) => !resolvedResolvers.has(d))) {
      // not every dependency has been resolved, add it to pending resolvers and return unresolved
      pendingResolvers.add(resolverId);
      return undefined;
    } else {
      // every dependency has been resolved, resolve and add it to just resolved resolvers
      justResolvedResolvers.add(resolverId);
      return resolver(root);
    }
  };

  let resolvedData = graphql(resolver, mixedQuery, data);

  while (pendingResolvers.size > 0) {
    resolvedResolvers = new Set([...resolvedResolvers, ...justResolvedResolvers]);
    pendingResolvers = new Set();
    justResolvedResolvers = new Set();
    resolvedData = graphql(resolver, mixedQuery, resolvedData);
  }

  return graphql(resolver, originalQuery, resolvedData);
}
