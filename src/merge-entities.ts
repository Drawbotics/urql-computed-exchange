import fclone from 'fclone';

import { Entities, Entity } from './types';

function _mergeFields(target: Entity, source: Entity): Entity {
  const targetCopy = fclone(target);

  targetCopy.fields = Object.keys(source.fields).reduce((memo, key) => {
    if (Object.prototype.hasOwnProperty.call(memo, key)) {
      throw new Error(
        `Duplicated key "${key}" found when merging entities of type "${target.typeName}"`,
      );
    }

    return { ...memo, [key]: source.fields[key] };
  }, targetCopy.fields);

  return targetCopy;
}

export function mergeEntities(...entities: Array<Entity>): Entities {
  return entities.reduce((memo, entity) => {
    const { typeName } = entity;

    if (typeName == null) {
      console.error('No typeName found for entity', entity);
      throw new Error('No typeName found for entity');
    }

    const existingEntity = memo[typeName];

    if (existingEntity == null) {
      return { ...memo, [typeName]: entity };
    }

    return {
      ...memo,
      [typeName]: _mergeFields(existingEntity, entity),
    };
  }, {} as Entities);
}
