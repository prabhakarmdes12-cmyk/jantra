import { hashSeed } from "../engine/prng";

export function computeRecipeChecksum(recipe: unknown): string {
  const json = JSON.stringify(recipe);
  const hash = hashSeed(json);
  return hash.toString(16).padStart(8, "0");
}
