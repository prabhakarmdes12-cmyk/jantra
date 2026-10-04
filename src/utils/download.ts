/**
 * Browser file download helper
 */
export function downloadTextFile(content: string, filename: string, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Render SVG string to a high-resolution PNG using an off-screen HTML5 Canvas
 */
export async function exportSceneToPNG(
  svgString: string,
  width: number,
  height: number,
  scale: 1 | 2 | 4 = 1,
  background = "transparent"
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get 2D canvas context"));
      return;
    }

    // High quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (background && background !== "transparent") {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas toBlob failed"));
        }
      }, "image/png");
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };

    img.src = url;
  });
}

/**
 * Download blob directly
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.warn("Clipboard write failed, fallback to textarea:", err);
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch (e) {
      return false;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Friendly wrappers used by the studio Export Card                    */
/* ------------------------------------------------------------------ */

export function downloadSVG(svg: string, filename: string) {
  downloadTextFile(svg, filename, "image/svg+xml;charset=utf-8");
}

export function downloadJSON(data: unknown, filename: string) {
  downloadTextFile(JSON.stringify(data, null, 2), filename, "application/json");
}

export async function downloadPNG(svg: string, filename: string, width: number, height: number) {
  const blob = await exportSceneToPNG(svg, width, height, 1, "transparent");
  downloadBlob(blob, filename);
}
