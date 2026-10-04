import { GrammarFamily } from "../../types/recipe";
import { BuildContext, LayerBuilder } from "../context";
import { buildLotus } from "./lotus";
import { buildTemple } from "./temple";
import { buildMandala } from "./mandala";
import { buildYantra } from "./yantra";
import { buildOrganic } from "./organic";
import { buildOrnamental } from "./ornamental";
import { buildMinimal } from "./minimal";
import { buildExperimental } from "./experimental";

export type GrammarPipeline = (ctx: BuildContext, layers: LayerBuilder) => void;

export const GRAMMAR_PIPELINES: Record<GrammarFamily, GrammarPipeline> = {
  lotus: buildLotus,
  temple: buildTemple,
  mandala: buildMandala,
  yantra: buildYantra,
  organic: buildOrganic,
  ornamental: buildOrnamental,
  minimal: buildMinimal,
  experimental: buildExperimental,
};

export function resolvePipeline(family: GrammarFamily | string | undefined): GrammarPipeline {
  if (family && family in GRAMMAR_PIPELINES) {
    return GRAMMAR_PIPELINES[family as GrammarFamily];
  }
  return buildLotus;
}
