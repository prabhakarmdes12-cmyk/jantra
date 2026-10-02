import React, { useMemo } from "react";
import { GeneratedScene, SVGPathElementData, SVGCircleElementData, SVGPolygonElementData } from "../../types/geometry";

interface CanvasProps {
  scene: GeneratedScene;
  zoom: number;
  pan: { x: number; y: number };
  isDragging: boolean;
  showGrid: boolean;
  growthProgress: number; // 0.0 to 1.0
  glowEffect?: boolean;
  handlers: React.DOMAttributes<HTMLDivElement>;
  containerRef: React.Ref<HTMLDivElement>;
}

export const Canvas: React.FC<CanvasProps> = ({
  scene,
  zoom,
  pan,
  isDragging,
  showGrid,
  growthProgress,
  glowEffect = false,
  handlers,
  containerRef,
}) => {
  const isFinal = growthProgress >= 0.999;

  const renderElement = (
    el: SVGPathElementData | SVGCircleElementData | SVGPolygonElementData,
    groupProgressRatio: number
  ) => {
    if (groupProgressRatio <= 0) return null;

    if ("d" in el) {
      const path = el as SVGPathElementData;
      if (!isFinal && groupProgressRatio < 1) {
        const estLength = 1200;
        const offset = estLength * (1 - groupProgressRatio);
        return (
          <path
            key={path.id}
            id={path.id}
            d={path.d}
            stroke={path.stroke}
            strokeWidth={path.strokeWidth}
            strokeLinecap={path.strokeLinecap}
            strokeLinejoin={path.strokeLinejoin}
            strokeDasharray={`${estLength} ${estLength}`}
            strokeDashoffset={offset}
            fill={groupProgressRatio > 0.8 ? path.fill : "none"}
            fillOpacity={path.fillOpacity}
            filter={glowEffect ? "url(#jantra-glow)" : undefined}
            className={path.className}
          />
        );
      }

      return (
        <path
          key={path.id}
          id={path.id}
          d={path.d}
          stroke={path.stroke}
          strokeWidth={path.strokeWidth}
          strokeLinecap={path.strokeLinecap}
          strokeLinejoin={path.strokeLinejoin}
          strokeDasharray={path.strokeDasharray}
          fill={path.fill || "none"}
          fillOpacity={path.fillOpacity}
          filter={glowEffect ? "url(#jantra-glow)" : undefined}
          className={path.className}
        />
      );
    } else if ("r" in el) {
      const circle = el as SVGCircleElementData;
      const currentR = isFinal ? circle.r : circle.r * Math.min(1, groupProgressRatio * 1.2);
      return (
        <circle
          key={circle.id}
          id={circle.id}
          cx={circle.cx}
          cy={circle.cy}
          r={currentR}
          stroke={circle.stroke}
          strokeWidth={circle.strokeWidth}
          strokeDasharray={circle.strokeDasharray}
          fill={circle.fill || "none"}
          fillOpacity={circle.fillOpacity}
          filter={glowEffect ? "url(#jantra-glow)" : undefined}
        />
      );
    } else if ("points" in el) {
      const poly = el as SVGPolygonElementData;
      return (
        <polygon
          key={poly.id}
          id={poly.id}
          points={poly.points}
          stroke={poly.stroke}
          strokeWidth={poly.strokeWidth}
          fill={poly.fill || "none"}
          fillOpacity={poly.fillOpacity}
          filter={glowEffect ? "url(#jantra-glow)" : undefined}
        />
      );
    }
    return null;
  };

  const renderedGroups = useMemo(() => {
    return scene.groups.map((group) => {
      let startProgress = 0.0;
      let endProgress = 1.0;

      if (group.id === "jantra-bindu-center") {
        startProgress = 0.0;
        endProgress = 0.2;
      } else if (group.id === "jantra-guide-lines" || group.id === "jantra-outer-rings") {
        startProgress = 0.15;
        endProgress = 0.45;
      } else if (group.id === "jantra-polygons-layer" || group.id === "jantra-petals-layer") {
        startProgress = 0.35;
        endProgress = 0.78;
      } else if (group.id === "jantra-ornaments") {
        startProgress = 0.65;
        endProgress = 0.88;
      } else if (group.id === "jantra-bhupura-enclosure") {
        startProgress = 0.8;
        endProgress = 1.0;
      } else if (group.id === "jantra-background") {
        startProgress = 0.0;
        endProgress = 0.1;
      }

      let ratio = 1.0;
      if (!isFinal) {
        if (growthProgress < startProgress) {
          ratio = 0.0;
        } else if (growthProgress >= endProgress) {
          ratio = 1.0;
        } else {
          ratio = (growthProgress - startProgress) / (endProgress - startProgress);
        }
      }

      if (ratio <= 0) return null;

      return (
        <g key={group.id} id={group.id} data-name={group.name} opacity={isFinal ? 1 : Math.min(1, ratio * 1.5)}>
          {group.elements.map((el) => renderElement(el, ratio))}
        </g>
      );
    });
  }, [scene.groups, growthProgress, isFinal, glowEffect]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none bg-[#09090b] flex items-center justify-center ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      {...handlers}
    >
      {/* Background Dot Grid */}
      {showGrid && (
        <div className="absolute inset-0 bg-dot-grid opacity-35 pointer-events-none" />
      )}

      {/* Axis Crosshairs */}
      {showGrid && (
        <div
          className="absolute pointer-events-none opacity-20"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
          }}
        >
          <div className="absolute w-[2400px] h-[1px] bg-zinc-500 -left-[1200px] top-0" />
          <div className="absolute h-[2400px] w-[1px] bg-zinc-500 left-0 -top-[1200px]" />
          <div className="absolute w-8 h-8 -left-4 -top-4 rounded-full border border-dashed border-zinc-500" />
        </div>
      )}

      {/* Artboard Container */}
      <div
        className="relative transition-transform duration-75 will-change-transform"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        <div className="relative shadow-2xl shadow-black/80 rounded-sm overflow-hidden bg-[#0a0a0c] border border-zinc-800/80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={scene.viewBox}
            width={scene.width}
            height={scene.height}
            className="block max-w-none pointer-events-none"
            style={{ width: `${scene.width}px`, height: `${scene.height}px` }}
          >
            {/* Sacred Glow Filter Definition */}
            <defs>
              <filter id="jantra-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {renderedGroups}
          </svg>
        </div>
      </div>
    </div>
  );
};
