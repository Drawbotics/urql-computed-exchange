export function union<T = any>(setA: Set<T>, setB: Set<T>) {
  return new Set<T>([...setA, ...setB]);
}

export function difference<T = any>(setA: Set<T>, setB: Set<T>) {
  return new Set([...setA].filter((v) => !setB.has(v)));
}

export function intersection<T = any>(setA: Set<T>, setB: Set<T>) {
  return new Set([...setA].filter((v) => setB.has(v)));
}

export function isEqual<T = any>(setA: Set<T>, setB: Set<T>): boolean {
  return difference(setA, setB).size === 0;
}
