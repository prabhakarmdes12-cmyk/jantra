export interface RecursionTier {
  depthIndex: number;
  scale: number;
  rotationOffset: number;
  weightFactor: number;
  opacity: number;
}

export function generateRecursionTiers(
  maxDepth: number,
  scaleFactor: number,
  segments: number
): RecursionTier[] {
  const depth = Math.max(0, Math.min(6, maxDepth));
  const scale = Math.max(0.2, Math.min(0.9, scaleFactor));
  const tiers: RecursionTier[] = [];

  let currentScale = 1.0;
  const angleOffsetStep = segments > 0 ? (Math.PI / segments) : (Math.PI / 8);

  for (let i = 0; i <= depth; i++) {
    tiers.push({
      depthIndex: i,
      scale: currentScale,
      rotationOffset: (i % 2 === 1) ? angleOffsetStep : 0,
      weightFactor: Math.max(0.4, Math.pow(0.85, i)),
      opacity: Math.max(0.35, 1 - (i * 0.1)),
    });
    currentScale *= scale;
  }

  return tiers;
}
