/**
 * Deterministic Pseudo-Random Number Generator (Mulberry32)
 * Ensures 100% reproducible visual output from any seed string or number.
 * Never calls Math.random().
 */

export interface PRNG {
  next: () => number; // [0, 1)
  range: (min: number, max: number) => number;
  int: (min: number, max: number) => number;
  bool: (probability?: number) => boolean;
  choice: <T>(arr: T[]) => T;
  fork: (subSeedOffset?: number) => PRNG;
}

export function hashSeed(seed: string | number): number {
  const str = String(seed);
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function createPRNG(seed: string | number): PRNG {
  let s = hashSeed(seed);

  const next = (): number => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const range = (min: number, max: number): number => {
    return min + next() * (max - min);
  };

  const int = (min: number, max: number): number => {
    return Math.floor(range(min, max + 1));
  };

  const bool = (probability = 0.5): boolean => {
    return next() < probability;
  };

  const choice = <T>(arr: T[]): T => {
    if (arr.length === 0) throw new Error("Choice from empty array");
    return arr[int(0, arr.length - 1)];
  };

  const fork = (subSeedOffset = 1): PRNG => {
    return createPRNG(`${seed}_fork_${subSeedOffset}_${next()}`);
  };

  return { next, range, int, bool, choice, fork };
}
