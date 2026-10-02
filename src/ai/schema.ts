import { JantraRecipe } from "../types/recipe";

export interface IntentParseResult {
  rawPrompt: string;
  matchedKeywords: string[];
  suggestedRecipe: JantraRecipe;
  changesSummary: {
    label: string;
    from: string | number;
    to: string | number;
  }[];
  explanation: string;
  confidence: number;
}
