import React from "react";
import { GeneratedScene, SVGElementData } from "../../types/geometry";

interface SceneSVGProps {
  scene: GeneratedScene;
  width?: number | string;
  height?: number | string;
  /** 0 → 1 reveal for the growth animation. 1 = fully drawn. */
  growth?: number;
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Layer ids that should not render (Inspect mode layer toggles). */
  hiddenLayers?: Set<string>;
  idPrefix?: string;
}

/** Narrative order in which layers are drawn during the growth animation. */
const GROWTH_WINDOW: Record<string, [number, number]> = {
  "jantra-background": [0, 0.05],
  "jantra-bindu": [0.0, 0.16],
  "jantra-construction": [0.08, 0.34],
  "jantra-orbits": [0.2, 0.5],
  "jantra-lattice": [0.3, 0.6],
  "jantra-architecture": [0.32, 0.64],
  "jantra-petals": [0.4, 0.76],
  "jantra-ribbing": [0.6, 0.86],
  "jantra-polygons": [0.44, 0.8],
  "jantra-ornaments": [0.66, 0.92],
  "jantra-nodes": [0.84, 0.96],
  "jantra-bhupura": [0.74, 1.0],
};

function renderElement(el: SVGElementData, ratio: number, glow: boolean, prefix: string) {
  const filter = glow ? "url(#jantra-glow)" : undefined;
  const key = `${prefix}${el.id}`;

  if ("d" in el) {
    const drawing = ratio < 1;
    const len = 2400;
    return (
      <path
        key={key}
        id={key}
        d={el.d}
        stroke={el.stroke}
        strokeWidth={el.strokeWidth}
        strokeOpacity={el.strokeOpacity}
        strokeLinecap={el.strokeLinecap}
        strokeLinejoin={el.strokeLinejoin}
        strokeDasharray={drawing ? `${len} ${len}` : el.strokeDasharray}
        strokeDashoffset={drawing ? len * (1 - ratio) : undefined}
        fill={drawing ? "none" : el.fill || "none"}
        fillOpacity={el.fillOpacity}
        opacity={el.opacity}
        filter={filter}
      />
    );
  }
  if ("r" in el) {
    return (
      <circle
        key={key}
        id={key}
        cx={el.cx}
        cy={el.cy}
        r={ratio < 1 ? el.r * ratio : el.r}
        stroke={el.stroke}
        strokeWidth={el.strokeWidth}
        strokeOpacity={el.strokeOpacity}
        strokeDasharray={el.strokeDasharray}
        fill={el.fill || "none"}
        fillOpacity={el.fillOpacity}
        opacity={el.opacity}
        filter={filter}
      />
    );
  }
  return (
    <polygon
      key={key}
      id={key}
      points={el.points}
      stroke={el.stroke}
      strokeWidth={el.strokeWidth}
      strokeOpacity={el.strokeOpacity}
      fill={el.fill || "none"}
      fillOpacity={el.fillOpacity}
      opacity={el.opacity}
      filter={filter}
    />
  );
}

export const SceneSVG: React.FC<SceneSVGProps> = ({
  scene,
  width,
  height,
  growth = 1,
  glow = false,
  className,
  style,
  hiddenLayers,
  idPrefix = "",
}) => {
  const isFinal = growth >= 0.999;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={scene.viewBox}
      width={width ?? scene.width}
      height={height ?? scene.height}
      className={className}
      style={style}
      shapeRendering="geometricPrecision"
    >
      <defs>
        <filter id="jantra-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {scene.groups.map((group) => {
        if (hiddenLayers?.has(group.id)) return null;
        const [start, end] = GROWTH_WINDOW[group.id] ?? [0, 1];
        let ratio = 1;
        if (!isFinal) {
          if (growth <= start) ratio = 0;
          else if (growth >= end) ratio = 1;
          else ratio = (growth - start) / (end - start);
        }
        if (ratio <= 0) return null;

        return (
          <g
            key={group.id}
            id={`${idPrefix}${group.id}`}
            data-name={group.name}
            opacity={isFinal ? 1 : Math.min(1, ratio * 1.6)}
          >
            {group.elements.map((el) => renderElement(el, ratio, glow, idPrefix))}
          </g>
        );
      })}
    </svg>
  );
};
