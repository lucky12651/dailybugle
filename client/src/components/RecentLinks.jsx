import React from "react";

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
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Links</h2>

      {/* Responsive Search Container */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search coded URL"
          className="w-full sm:flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500 shadow-sm"
        />
        <button
          onClick={handleSearch}
          className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-md"
        >
          Search
        </button>
      </div>

      {displayedLinks.length > 0 ? (
        <div className="bg-gray-50 rounded-xl max-h-[400px] overflow-y-auto border border-gray-100 flex flex-col">
          <ul className="divide-y divide-gray-200">
            {displayedLinks.map((link, index) => (
              <li key={link.slug}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-100 transition-colors duration-150">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-bold text-blue-600 truncate hover:text-blue-800">
                      <a
                        href={`/${link.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {link.shortUrl}
                      </a>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center text-[10px] sm:text-s font-bold text-black-600 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-full">
                        {link.clicks}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="text-xs sm:text-sm text-gray-500 truncate max-w-full sm:max-w-xs">
                      <span className="font-semibold text-gray-400">
                        Original:
                      </span>{" "}
                      {link.longUrl}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={async () => {
                          const success = await copyToClipboard(link.shortUrl);
                          if (success) {
                            setCopiedIndex(index);
                            setTimeout(() => setCopiedIndex(null), 2000);
                          }
                        }}
                        className="flex-1 sm:flex-none justify-center inline-flex items-center px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                      >
                        {copiedIndex === index ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={() => fetchStats(link.slug)}
                        className="flex-1 sm:flex-none justify-center inline-flex items-center px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors"
                      >
                        Stats
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {/* Load More Button - Only show when not searching and there are more items */}
          {hasMore && searchResults === null && (
            <div className="p-4 flex justify-center border-t border-gray-200 bg-white sticky bottom-0">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 shadow-sm"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">
            {searchResults !== null
              ? "No results found"
              : "No recent links yet"}
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentLinks;
