import React, { useMemo } from "react";
import { JantraRecipe } from "../../types/recipe";
import { generateScene } from "../../engine/generator";
import { serializeSceneToSVG } from "../../engine/serializer";

interface VectorThumbnailProps {
  recipe: JantraRecipe;
  size?: number;
  className?: string;
}

/**
 * A live, fully generated vector thumbnail — the same deterministic engine,
 * rendered small. Serialized to markup and injected in one DOM write rather
 * than reconciled as hundreds of React nodes, which keeps the evolution
 * strip responsive while sliders are being dragged.
 */
export const VectorThumbnail: React.FC<VectorThumbnailProps> = ({ recipe, size = 92, className = "" }) => {
  const markup = useMemo(() => {
    // Thumbnails drop the sub-pixel layers that would just turn to mud.
    const light: JantraRecipe = {
      ...recipe,
      canvas: { ...recipe.canvas, background: "transparent" },
      parameters: {
        ...recipe.parameters,
        detail: {
          ribbing: recipe.parameters.detail?.ribbing ?? true,
          ribCount: Math.min(3, recipe.parameters.detail?.ribCount ?? 3),
          stipple: false,
          nodes: false,
          construction: false,
          lattice: false,
        },
      },
    };
    const scene = generateScene(light);
    return serializeSceneToSVG(scene, light, { minified: true, includeMetadata: false })
      .replace(/<\?xml[^>]*\?>/, "")
      .replace(/width="\d+"\s*height="\d+"/, `width="${size}" height="${size}"`);
  }, [recipe, size]);

  return (
    <div
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
};
