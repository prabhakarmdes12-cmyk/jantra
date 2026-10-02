import React, { useState, useEffect } from "react";
import { X, Bookmark, Plus, Trash2, Download, Check, Sparkles } from "lucide-react";
import { JantraRecipe } from "../../types/recipe";
import { generateScene } from "../../engine/generator";
import { serializeSceneToSVG } from "../../engine/serializer";
import { downloadTextFile } from "../../utils/download";

interface SavedArtwork {
  id: string;
  title: string;
  savedAt: string;
  seed: string | number;
  recipe: JantraRecipe;
  svgThumbnail: string;
}

interface SketchbookModalProps {
  isOpen: boolean;
  currentRecipe: JantraRecipe;
  onLoadRecipe: (recipe: JantraRecipe) => void;
  onClose: () => void;
}

const STORAGE_KEY = "jantra_sketchbook_bookmarks_v1";

export const SketchbookModal: React.FC<SketchbookModalProps> = ({
  isOpen,
  currentRecipe,
  onLoadRecipe,
  onClose,
}) => {
  const [artworks, setArtworks] = useState<SavedArtwork[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to load sketchbook from localStorage:", e);
      }
    }
    return [];
  });

  const [newTitle, setNewTitle] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(artworks));
      } catch (e) {
        console.warn("Failed to save sketchbook to localStorage:", e);
      }
    }
  }, [artworks]);

  if (!isOpen) return null;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim() || `Composition #${artworks.length + 1} (Seed ${currentRecipe.seed})`;
    const scene = generateScene(currentRecipe);
    const svg = serializeSceneToSVG(scene, currentRecipe, { minified: true });

    const newEntry: SavedArtwork = {
      id: `art_${Date.now()}`,
      title,
      savedAt: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      seed: currentRecipe.seed,
      recipe: currentRecipe,
      svgThumbnail: svg,
    };

    setArtworks([newEntry, ...artworks]);
    setNewTitle("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArtworks(artworks.filter((a) => a.id !== id));
  };

  const handleExportAll = () => {
    downloadTextFile(
      JSON.stringify(artworks, null, 2),
      `jantra-sketchbook-${Date.now()}.json`,
      "application/json"
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[88vh] overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Artist Sketchbook & Favorites</h2>
              <p className="text-xs text-zinc-400">Saved vector compositions stored in your local browser workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {artworks.length > 0 && (
              <button
                type="button"
                onClick={handleExportAll}
                className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Backup Sketchbook
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Save Current Banner Form */}
        <div className="p-4 bg-zinc-950/70 border-b border-zinc-800/80">
          <form onSubmit={handleSaveCurrent} className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Give current artwork a title (e.g. 'Copper Yantra Study #1')..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/15"
            >
              {justSaved ? <Check className="w-3.5 h-3.5 text-zinc-950" /> : <Plus className="w-3.5 h-3.5" />}
              {justSaved ? "Saved!" : "Bookmark Active Artwork"}
            </button>
          </form>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {artworks.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Sparkles className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-400 font-medium">Your sketchbook is empty</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Click "Bookmark Active Artwork" above to save any composition you create to your personal collection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {artworks.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onLoadRecipe(item.recipe);
                    onClose();
                  }}
                  className="group relative p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/80 hover:bg-zinc-850/50 cursor-pointer transition-all flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300 truncate block">
                      {item.title}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors shrink-0"
                      title="Delete from sketchbook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-full aspect-square rounded-lg bg-[#0a0a0c] border border-zinc-850 overflow-hidden flex items-center justify-center p-2 group-hover:scale-[1.02] transition-transform">
                    <div
                      className="w-full h-full flex items-center justify-center pointer-events-none"
                      dangerouslySetInnerHTML={{ __html: item.svgThumbnail }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-850">
                    <span>Seed: {item.seed}</span>
                    <span>{item.savedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
