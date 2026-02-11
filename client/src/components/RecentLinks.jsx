import React from "react";
import { Search, Copy, BarChart2, ExternalLink, History } from "lucide-react";

const RecentLinks = ({
  recentLinks,
  copiedIndex,
  setCopiedIndex,
  copyToClipboard,
  fetchStats,
  hasMore,
  loadMore,
  loadingMore,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState(null);

  const handleSearch = () => {
    const q = searchQuery.trim().toLowerCase();
    const results = recentLinks.filter((link) => {
      const short = (link.shortUrl || "").toLowerCase();
      const slug = (link.slug || "").toLowerCase();
      return q ? short.includes(q) || slug.includes(q) : true;
    });
    setSearchResults(results);
  };

  const displayedLinks = searchResults !== null ? searchResults : recentLinks;

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 sm:p-8 flex flex-col h-full max-h-[800px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="text-green-500" size={20} />
          Recent Links
        </h2>
        {recentLinks.length > 0 && (
          <span className="text-xs font-mono text-zinc-500">
            {recentLinks.length} TOTAL
          </span>
        )}
      </div>

      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search links..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 text-white placeholder-zinc-600 text-sm transition-all"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-bold transition-all"
        >
          Search
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {displayedLinks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500 text-sm">No links found</p>
          </div>
        ) : (
          displayedLinks.map((link, index) => (
            <div
              key={link.slug}
              className="p-4 bg-zinc-900/50 border border-zinc-900 hover:border-zinc-800 rounded-xl transition-all group"
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <a
                    href={`/${link.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 font-bold hover:underline flex items-center gap-1 truncate"
                  >
                    {link.shortUrl}
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20">
                    {link.clicks} CLICKS
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-zinc-500 truncate max-w-[200px]">
                  {link.longUrl}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(link.shortUrl)}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-md transition-all"
                    title="Copy Link"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => fetchStats(link.slug)}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-green-500 rounded-md transition-all"
                    title="View Stats"
                  >
                    <BarChart2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full py-3 text-sm text-zinc-500 hover:text-white transition-all font-medium"
          >
            {loadingMore ? "Loading..." : "Load more links"}
          </button>
        )}
      </div>
    </div>
  );
};

export default RecentLinks;
