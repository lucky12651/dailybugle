import React from "react";
import { Link2, Sparkles, User, ArrowRight } from "lucide-react";

const LinkForm = ({
  longUrl,
  setLongUrl,
  customSlug,
  setCustomSlug,
  userId,
  setUserId,
  loading,
  handleSubmit,
  error,
  shortUrl,
  copiedIndex,
  setCopiedIndex,
  copyToClipboard,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Link2 className="text-green-500" />
          Shorten a long link
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="longUrl"
              className="block text-sm font-medium text-zinc-400 mb-2"
            >
              Paste your long link here
            </label>
            <input
              type="url"
              id="longUrl"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com/my-long-url"
              required
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 text-white placeholder-zinc-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="customSlug"
                className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-1"
              >
                <Sparkles size={14} />
                Custom Alias (Optional)
              </label>
              <input
                type="text"
                id="customSlug"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="my-custom-slug"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 text-white placeholder-zinc-600 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-1"
              >
                <User size={14} />
                User ID (Optional)
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="user-123"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 text-white placeholder-zinc-600 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-start pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-black rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? "Processing..." : (
            <>
              Get your link
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 text-sm">
          {error}
        </div>
      )}

      {shortUrl && (
        <div className="mt-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-green-500 uppercase tracking-wider mb-1">
                Your shortened link
              </p>
              <p className="text-lg font-bold text-white truncate">
                {shortUrl}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(shortUrl)}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-black rounded-lg text-sm font-bold transition-all"
            >
              {copiedIndex !== null ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default LinkForm;
