import { useState, useRef, useCallback, useEffect } from "react";

export function usePanZoom() {
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showGuides, setShowGuides] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isSpacePressed = useRef<boolean>(false);

  // Keyboard space listener for pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        isSpacePressed.current = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        isSpacePressed.current = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only drag on canvas viewport directly, not on interactive overlays
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("form") || target.closest("aside") || target.closest(".no-pan")) {
      return;
    }

    if (e.button === 0 || e.button === 1 || isSpacePressed.current) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...pan };
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Smooth focal cursor zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left - rect.width / 2;
    const cursorY = e.clientY - rect.top - rect.height / 2;

    setZoom((prevZoom) => {
      const nextZoom = Math.min(5.0, Math.max(0.15, prevZoom * zoomFactor));
      const ratio = nextZoom / prevZoom;

      setPan((prevPan) => ({
        x: cursorX - (cursorX - prevPan.x) * ratio,
        y: cursorY - (cursorY - prevPan.y) * ratio,
      }));

      return Number(nextZoom.toFixed(3));
    });
  }, []);

  // Touch support for mobile pan & pinch-zoom
  const touchStartRef = useRef<{ dist: number; pan: { x: number; y: number }; center: { x: number; y: number } }>({
    dist: 0,
    pan: { x: 0, y: 0 },
    center: { x: 0, y: 0 },
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("form") || target.closest("aside") || target.closest(".no-pan")) {
      return;
    }

    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      touchStartRef.current = {
        dist,
        pan: { ...pan },
        center: {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        },
      };
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = dist / (touchStartRef.current.dist || 1);
      setZoom((prevZoom) => Math.min(5.0, Math.max(0.15, prevZoom * scale)));
      touchStartRef.current.dist = dist;
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(5.0, Number((z * 1.2).toFixed(2))));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.15, Number((z * 0.8).toFixed(2))));
  }, []);

  const resetView = useCallback(() => {
    setZoom(0.85);
    setPan({ x: 0, y: 0 });
  }, []);

  const fitToScreen = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const minDimension = Math.min(clientWidth, clientHeight);
      const fitZoom = Math.max(0.2, Math.min(1.5, (minDimension * 0.82) / 1600));
      setZoom(Number(fitZoom.toFixed(2)));
      setPan({ x: 0, y: 0 });
    }
  }, []);

  const toggleGrid = useCallback(() => {
    setShowGrid((g) => !g);
  }, []);

  const toggleGuides = useCallback(() => {
    setShowGuides((g) => !g);
  }, []);

  return {
    zoom,
    pan,
    isDragging,
    showGrid,
    showGuides,
    containerRef,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onWheel: handleWheel,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    zoomIn,
    zoomOut,
    resetView,
    fitToScreen,
    toggleGrid,
    toggleGuides,
  };
}
