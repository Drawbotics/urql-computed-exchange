import {
  ASTNode,
  DefinitionNode,
  DocumentNode,
  FieldNode,
  StringValueNode,
  ValueNode,
  visit,
} from 'graphql';
import flatten from 'lodash/flatten';

import { Entities, NodeWithDirectives } from './types';

function _isStringValueNode(node?: ValueNode): node is StringValueNode {
  return node != null && node.kind === 'StringValue';
}

function _isNodeWithDirectives(node?: any): node is NodeWithDirectives {
  return node != null && node.directives != null;
}

export function nodeHasComputedDirectives(node: ASTNode): boolean {
  if (!_isNodeWithDirectives(node)) {
    return false;
  }

  return node.directives != null && node.directives.some((d) => d.name.value === 'computed');
}

// Return type is "any" because that's the return type of the visit() function from graphql
export function replaceDirectivesByFragments(
  query: DefinitionNode | DocumentNode,
  entities: Entities,
): any {
  const replaceDirectiveByFragment = (node: FieldNode) => {
    const computedDirective = node.directives?.find((d) => d.name.value === 'computed');

    if (!_isStringValueNode(computedDirective?.arguments?.[0].value)) {
      throw new Error('Invalid type name found in @computed directive.');
    }

    const directiveType = computedDirective?.arguments?.[0].value.value;

    if (directiveType == null) {
      throw new Error('Invalid @computed directive found. No type specified');
    }

    const entityType = entities[directiveType];
    const fieldName = node.name.value;
    const entityField = entityType.fields[fieldName];

    if (entityField == null) {
      throw new Error(
        `No resolver found for @computed directive "${fieldName}" in type "${directiveType}`,
      );
    }

    // Replace directive node by fragment
    return replaceDirectivesByFragments(entityField.dependencies.definitions[0], entities);
  };

  return visit(query, {
    Field(node) {
      if (!nodeHasComputedDirectives(node)) {
        return undefined; // Don't do anything with this node
      }

      return replaceDirectiveByFragment(node);
    },
    Directive(node) {
      if (node.name.value === 'computed') {
        return null; // Remove @computed directives from the query
      }
    },
  });
}

// Return type is "any" because that's the return type of the visit() function from graphql
export function addFragmentsFromDirectives(
  query: DefinitionNode | DocumentNode,
  entities: Entities,
): any {
  const addFragmentToNode = (node: FieldNode) => {
    const computedDirective = node.directives?.find((d) => d.name.value === 'computed');

    if (!_isStringValueNode(computedDirective?.arguments?.[0].value)) {
      throw new Error('Invalid type name found in @computed directive.');
    }

    const directiveType = computedDirective?.arguments?.[0].value.value;

    if (directiveType == null) {
      throw new Error('Invalid @computed directive found. No type specified');
    }

    const entityType = entities[directiveType];

    if (entityType == null) {
      throw new Error(`No entity found for type "${directiveType}"`);
    }

    const fieldName = node.name.value;
    const entityField = entityType.fields[fieldName];

    if (entityField == null) {
      throw new Error(
        `No resolver found for @computed directive "${fieldName}" in type "${directiveType}`,
      );
    }

    return addFragmentsFromDirectives(entityField.dependencies.definitions[0], entities);
  };

  const firstPass = visit(query, {
    Field(node) {
      if (!nodeHasComputedDirectives(node)) {
        return undefined; // Don't do anything with this node
      }
      return [node, addFragmentToNode(node)];
    },
  });

  // Flatten nodes that instead of being a single node, are an array
  // of Field and InlineFragment from the firstPass
  return visit(firstPass, {
    SelectionSet(node) {
      node.selections = flatten(node.selections);
      return node;
    },
  });
}
