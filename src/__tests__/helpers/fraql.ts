import { parse, print, Source } from 'graphql';

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

export default function gql(strings: TemplateStringsArray, ...values: any[]): any {
  const source = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
  const doc = parse(source);

  if (doc.definitions.every(({ kind }: any) => kind === 'FragmentDefinition')) {
    return toInlineFragment(doc);
  }

  return doc;
}
