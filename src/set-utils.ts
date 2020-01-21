export function union<T = any>(setA: Set<T>, setB: Set<T>) {
  return new Set<T>([...setA, ...setB]);
}

export function difference<T = any>(setA: Set<T>, setB: Set<T>) {
  const firstHalf = new Set([...setA].filter((v) => !setB.has(v)));
  const secondHalf = new Set([...setB].filter((v) => !setA.has(v)));
  return union(firstHalf, secondHalf);
}

export function intersection<T = any>(setA: Set<T>, setB: Set<T>) {
  const firstHalf = new Set([...setA].filter((v) => setB.has(v)));
  const secondHalf = new Set([...setB].filter((v) => setA.has(v)));
  return union(firstHalf, secondHalf);
}

export function isEqual<T = any>(setA: Set<T>, setB: Set<T>): boolean {
  return difference(setA, setB).size === 0;
}
