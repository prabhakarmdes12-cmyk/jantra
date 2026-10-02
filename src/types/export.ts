export type ExportFormat = "svg" | "svg-animated" | "svg-plotter" | "svg-minified" | "png-1x" | "png-2x" | "png-4x" | "png-8k" | "json";

export interface PreflightDiagnostic {
  pathCount: number;
  vertexCount: number;
  estimatedFileSizeKB: number;
  viewBox: string;
  hasForeignObjects: boolean;
  hasScripts: boolean;
  hasExternalDependencies: boolean;
  figmaCompatible: boolean;
  illustratorCompatible: boolean;
  inkscapeCompatible: boolean;
  plotterReady: boolean;
  layerGroups: string[];
}
