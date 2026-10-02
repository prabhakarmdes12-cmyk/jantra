import React from "react";
import { GeneratedScene } from "../../types/geometry";

interface PatternTileOverlayProps {
  scene: GeneratedScene;
  zoom: number;
  pan: { x: number; y: number };
  tileSize?: 2 | 3;
}

export const PatternTileOverlay: React.FC<PatternTileOverlayProps> = ({
  scene,
  zoom,
  pan,
  tileSize = 3,
}) => {
  const count = tileSize;
  const tiles: { row: number; col: number; offsetX: number; offsetY: number }[] = [];

  const halfCount = Math.floor(count / 2);
  for (let r = -halfCount; r <= halfCount; r++) {
    for (let c = -halfCount; c <= halfCount; c++) {
      tiles.push({
        row: r,
        col: c,
        offsetX: c * scene.width,
        offsetY: r * scene.height,
      });
    }
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
    >
      <div
        className="relative transition-transform duration-75 will-change-transform"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom * 0.45})`,
          transformOrigin: "center center",
        }}
      >
        <div
          className="relative"
          style={{
            width: `${scene.width * count}px`,
            height: `${scene.height * count}px`,
            left: `-${(scene.width * count) / 2}px`,
            top: `-${(scene.height * count) / 2}px`,
          }}
        >
          {tiles.map((t, idx) => (
            <div
              key={idx}
              className="absolute border border-zinc-800/40"
              style={{
                left: `${(t.col + halfCount) * scene.width}px`,
                top: `${(t.row + halfCount) * scene.height}px`,
                width: `${scene.width}px`,
                height: `${scene.height}px`,
              }}
            >
              <svg
                viewBox={scene.viewBox}
                width={scene.width}
                height={scene.height}
                className="w-full h-full block"
              >
                {scene.groups.map((g) => (
                  <g key={g.id} id={`${g.id}-tile-${idx}`}>
                    {g.elements.map((el) => {
                      if ("d" in el) {
                        return (
                          <path
                            key={el.id}
                            d={el.d}
                            stroke={el.stroke}
                            strokeWidth={el.strokeWidth}
                            strokeLinecap={el.strokeLinecap}
                            strokeLinejoin={el.strokeLinejoin}
                            fill={el.fill || "none"}
                          />
                        );
                      } else if ("r" in el) {
                        return (
                          <circle
                            key={el.id}
                            cx={el.cx}
                            cy={el.cy}
                            r={el.r}
                            stroke={el.stroke}
                            strokeWidth={el.strokeWidth}
                            fill={el.fill || "none"}
                          />
                        );
                      } else if ("points" in el) {
                        return (
                          <polygon
                            key={el.id}
                            points={el.points}
                            stroke={el.stroke}
                            strokeWidth={el.strokeWidth}
                            fill={el.fill || "none"}
                          />
                        );
                      }
                      return null;
                    })}
                  </g>
                ))}
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
