"use client";
import React, { useEffect, useState } from "react";

const LinkGeneratorModal = ({ isOpen, onClose, initialUserId }) => {
  const [linksInput, setLinksInput] = useState("");
  const [userId, setUserId] = useState(initialUserId || "");
  const [generatedLinks, setGeneratedLinks] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [clickedIndices, setClickedIndices] = useState(new Set());

  useEffect(() => {
    if (initialUserId) setUserId(initialUserId);
  }, [initialUserId]);

  const handleGenerate = () => {
    if (!linksInput.trim() || !userId.trim()) return;

    // Normalize: force each http onto its own line
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h4 className="text-xl font-semibold">Bulk Link Generator</h4>
            <p className="text-sm text-gray-500">Click any link to copy it</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">User ID</label>
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="ps"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Paste Links
              </label>
              <textarea
                value={linksInput}
                onChange={(e) => setLinksInput(e.target.value)}
                className="w-full h-64 px-4 py-3 border rounded-xl resize-none"
                placeholder="Paste any messy links here"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!linksInput.trim() || !userId.trim()}
              className="w-full py-3 bg-blue-600 text-white rounded-xl disabled:bg-gray-300"
            >
              Generate Links
            </button>
          </div>

          {/* Output */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Generated Links</label>

            <div className="flex-grow bg-gray-50 border rounded-xl p-4 overflow-y-auto">
              {generatedLinks.length === 0 ? (
                <p className="text-sm text-gray-400">No links generated yet</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {generatedLinks.map((link, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleCopySingle(link, idx)}
                      className={`cursor-pointer p-2 rounded-lg border break-all transition ${
                        copiedIndex === idx
                          ? "bg-green-100 border-green-300 text-green-700"
                          : clickedIndices.has(idx)
                            ? "bg-blue-50 border-blue-400 text-blue-700"
                            : "bg-white hover:bg-blue-50"
                      }`}
                      title="Click to copy"
                    >
                      {copiedIndex === idx ? "Copied!" : link}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-2">
              {generatedLinks.length} links generated
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkGeneratorModal;
