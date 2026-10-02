import React from "react";
import { X, Command } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "Cmd/Ctrl + Z", desc: "Undo last parameter change" },
    { key: "Cmd/Ctrl + Shift + Z", desc: "Redo parameter change" },
    { key: "Space + Drag", desc: "Pan around infinite canvas" },
    { key: "Mouse Scroll", desc: "Smooth zoom in / out at cursor" },
    { key: "Pinch to Zoom", desc: "Trackpad / Mobile touch zoom" },
    { key: "R", desc: "Randomize seed with deterministic generator" },
    { key: "G", desc: "Toggle background coordinate grid" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Command className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-white">Keyboard Shortcuts</h2>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
              <span className="text-zinc-400">{s.desc}</span>
              <kbd className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 font-mono text-[11px] text-amber-300 font-medium">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
