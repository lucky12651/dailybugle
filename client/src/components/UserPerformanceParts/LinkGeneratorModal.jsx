"use client";
import React, { useEffect, useState } from "react";
import {
  X,
  Copy,
  Check,
  Wand2,
  User,
  Link as LinkIcon,
  List,
} from "lucide-react";

const LinkGeneratorModal = ({
  isOpen,
  setIsOpen,
  selectedUser,
  token,
  onLinkGenerated,
}) => {
  const [linksInput, setLinksInput] = useState("");
  const [userId, setUserId] = useState(selectedUser || "");
  const [generatedLinks, setGeneratedLinks] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [clickedIndices, setClickedIndices] = useState(new Set());

  useEffect(() => {
    if (selectedUser) setUserId(selectedUser);
  }, [selectedUser]);

  const handleGenerate = () => {
    if (!linksInput.trim() || !userId.trim()) return;

    const normalized = linksInput
      .replace(/https?:\/\//g, "\nhttps://")
      .replace(/^\n/, "");

    const urls = normalized
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.startsWith("http"))
      .map((url) => url.replace(/\/$/, "") + "/" + userId);

    setGeneratedLinks(urls);
    setCopiedIndex(null);
    setClickedIndices(new Set());
  };

  const handleCopySingle = async (link, index) => {
    await navigator.clipboard.writeText(link);
    setCopiedIndex(index);
    setClickedIndices((prev) => new Set(prev).add(index));
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-md px-6 py-4 border-b border-zinc-900 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <Wand2 className="text-blue-500" size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">
                Bulk Link Generator
              </h4>
              <p className="text-xs text-zinc-500">
                Transform messy links with tracking IDs
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-zinc-900 rounded-xl transition-all text-zinc-500 hover:text-white border border-transparent hover:border-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <User size={14} className="text-blue-500" />
                Target User ID
              </label>
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                placeholder="e.g. ps, user123"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <LinkIcon size={14} className="text-blue-500" />
                Source Links
              </label>
              <textarea
                value={linksInput}
                onChange={(e) => setLinksInput(e.target.value)}
                className="w-full h-72 px-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all resize-none custom-scrollbar"
                placeholder="Paste your links here...&#10;Multiple links will be detected automatically."
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!linksInput.trim() || !userId.trim()}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black rounded-2xl transition-all shadow-lg shadow-blue-600/10 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Wand2 size={20} />
              Generate Tracking Links
            </button>
          </div>

          {/* Output Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                <List size={14} className="text-blue-500" />
                Generated Output
              </label>
              <span className="text-[10px] font-bold bg-zinc-900 text-zinc-400 px-2 py-1 rounded-md border border-zinc-800">
                {generatedLinks.length} Links
              </span>
            </div>

            <div className="flex-grow bg-zinc-900/50 border border-zinc-900 rounded-2xl p-4 overflow-y-auto custom-scrollbar min-h-[400px]">
              {generatedLinks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="p-4 bg-zinc-900 rounded-full mb-4">
                    <LinkIcon size={32} className="text-zinc-700" />
                  </div>
                  <p className="text-zinc-500 text-sm font-medium">
                    No links generated yet.
                    <br />
                    Paste some sources and hit generate.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {generatedLinks.map((link, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopySingle(link, idx)}
                      className={`group cursor-pointer p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        copiedIndex === idx
                          ? "bg-green-500/10 border-green-500/30 text-green-500"
                          : clickedIndices.has(idx)
                            ? "bg-blue-500/5 border-blue-500/20 text-zinc-300"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-medium break-all leading-relaxed">
                        {link}
                      </span>
                      <div className="shrink-0 mt-0.5">
                        {copiedIndex === idx ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy
                            size={14}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl">
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                <span className="text-zinc-300 font-bold">Pro Tip:</span> Click
                any generated link to copy it instantly. Clicked links are
                highlighted to help you track progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkGeneratorModal;
