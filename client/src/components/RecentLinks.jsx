import React from "react";

const RecentLinks = ({
  recentLinks,
  copiedIndex,
  setCopiedIndex,
  copyToClipboard,
  fetchStats,
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
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Links</h2>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search coded URL"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
        >
          Search
        </button>
      </div>
      {displayedLinks.length > 0 ? (
        <div className="bg-gray-50 rounded-xl max-h-[300px] overflow-y-auto">
          <ul className="divide-y divide-gray-200">
            {displayedLinks.map((link, index) => (
              <li key={link.slug}>
                <div className="px-6 py-4 hover:bg-gray-100 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-blue-600 truncate hover:text-blue-800 transition-colors duration-150">
                      <a
                        href={`/${link.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {link.shortUrl}
                      </a>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                        {link.clicks} clicks
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-sm text-gray-600 truncate max-w-xs">
                      Original: {link.longUrl}
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
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                      >
                        {copiedIndex === index ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={() => fetchStats(link.slug)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors duration-200"
                      >
                        Stats
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchResults !== null ? "No results" : "No recent links yet"}
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentLinks;
