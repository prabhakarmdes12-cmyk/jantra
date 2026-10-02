import LZString from "lz-string";
import { JantraRecipe } from "../types/recipe";

/**
 * Encode recipe into URL hash string
 */
export function encodeRecipeToUrlHash(recipe: JantraRecipe): string {
  try {
    const json = JSON.stringify(recipe);
    const compressed = LZString.compressToEncodedURIComponent(json);
    return `#recipe=${compressed}`;
  } catch (err) {
    console.warn("Failed to compress recipe for URL:", err);
    return "";
  }
}

/**
 * Decode recipe from URL hash string
 */
export function decodeRecipeFromUrlHash(hash: string): JantraRecipe | null {
  try {
    if (!hash || !hash.includes("#recipe=")) return null;
    const compressed = hash.replace("#recipe=", "");
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (parsed && parsed.schemaVersion && parsed.parameters) {
      return parsed as JantraRecipe;
    }
  } catch (err) {
    console.warn("Failed to parse recipe from URL:", err);
  }
  return null;
}
