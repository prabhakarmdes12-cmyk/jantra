import { GrammarFamily, JantraRecipe } from "../types/recipe";

export interface IntentChange {
  label: string;
  from: string | number;
  to: string | number;
}

export interface IntentParseResult {
  rawPrompt: string;
  matchedKeywords: string[];
  suggestedRecipe: JantraRecipe;
  changesSummary: IntentChange[];
  /** Grammar family the prompt resolved to, if it named one. */
  matchedFamily?: GrammarFamily;
  explanation: string;
  /** Short one-line human summary suitable for an inline toast. */
  summary: string;
  confidence: number;
}
