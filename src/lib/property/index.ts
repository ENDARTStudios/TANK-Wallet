export function forAll<T>(generator: () => T, predicate: (value: T) => boolean, iterations = 100): { success: boolean; counterexample?: T } {
  for (let i = 0; i < iterations; i++) {
    const value = generator();
    if (!predicate(value)) return { success: false, counterexample: value };
  }
  return { success: true };
}

export function integerGenerator(min = 0, max = 100): () => number {
  return () => Math.floor(Math.random() * (max - min + 1)) + min;
}

export function stringGenerator(minLen = 1, maxLen = 10): () => string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  return () => {
    const len = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;
    let s = "";
    for (let i = 0; i < len; i++) s += chars[(Math.random() * chars.length) | 0];
    return s;
  };
}
