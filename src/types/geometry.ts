export type Point = [number, number];

export interface SVGPathElementData {
  id: string;
  d: string;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeDasharray?: string;
  strokeLinecap?: "round" | "square" | "butt";
  strokeLinejoin?: "round" | "miter" | "bevel";
  fill?: string;
  fillOpacity?: number;
  opacity?: number;
  className?: string;
}

export interface SVGCircleElementData {
  id: string;
  cx: number;
  cy: number;
  r: number;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeDasharray?: string;
  fill?: string;
  fillOpacity?: number;
  opacity?: number;
}

export interface SVGPolygonElementData {
  id: string;
  points: string;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  fill?: string;
  fillOpacity?: number;
  opacity?: number;
}

export type SVGElementData = SVGPathElementData | SVGCircleElementData | SVGPolygonElementData;

export interface SVGGElementData {
  id: string;
  name: string;
  label: string;
  order: number;
  elements: SVGElementData[];
  transform?: string;
  opacity?: number;
}

export interface GeneratedScene {
  viewBox: string;
  width: number;
  height: number;
  background: string;
  groups: SVGGElementData[];
  totalPaths: number;
  totalVertices: number;
  computedLength: number;
}
