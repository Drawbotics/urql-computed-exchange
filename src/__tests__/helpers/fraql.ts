import graphqlTag, { disableFragmentWarnings } from 'graphql-tag';
import { print, Source } from 'graphql';

disableFragmentWarnings();

function toInlineFragment(doc: any): any {
  let definitions = doc.definitions.map((definition: any) => {
    if (definition.kind !== 'FragmentDefinition') {
      throw new Error('toInlineFragment must be called on a document that only contains fragments');
    }
    return {
      kind: 'InlineFragment',
      name: definition.name,
      directives: definition.directives,
      selectionSet: definition.selectionSet,
      typeCondition: definition.typeCondition,
    };
  });

  const definition = definitions[0];
  if (!definition) {
    throw new Error('Unable to find a fragment definition');
  }

  const newDoc = {
    ...doc,
    originalDocument: doc,
    definitions: [definition],
  };

  newDoc.loc = {
    ...doc.loc,
    source: new Source(print(newDoc)),
  };

  return newDoc;
}

export default function gql(...args: any[]): any {
  (graphqlTag as any).resetCaches();
  const doc = (graphqlTag as any)(...args);

  if (doc.definitions.every(({ kind }: any) => kind === 'FragmentDefinition')) {
    return toInlineFragment(doc);
  }

  return doc;
}
