import React from "react";

const LinksTable = ({ 
  userLinks, 
  loadingLinks, 
  selectedLink, 
  setSelectedLink, 
  dailyLink, 
  setDailyLink, 
  hasMoreLinks, 
  handleLoadMoreLinks, 
  loadingMoreLinks 
}) => {
  if (loadingLinks && userLinks.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h4 className="text-lg font-semibold text-gray-800">
          Accessed Links
        </h4>
      </div>

      {userLinks.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Accessed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userLinks.map((link, index) => (
                  <tr
                    key={`${link.slug}-${index}`}
                    className={`hover:bg-gray-50 transition-colors ${selectedLink?.slug === link.slug ? "bg-blue-50/50" : ""}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      /{link.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {link.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {link.lastAccessed
                        ? new Date(link.lastAccessed).toLocaleString(
                            "en-IN",
                            {
                              timeZone: "Asia/Kolkata",
                            },
                          )
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedLink(link)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                            selectedLink?.slug === link.slug
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
                          title="Detailed Analysis"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Info
                        </button>
                        <button
                          onClick={() => setDailyLink(link)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                            dailyLink?.slug === link.slug
                              ? "bg-emerald-600 text-white"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                          title="Daily Views (30d)"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          Daily
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMoreLinks && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-center">
              <button
                onClick={handleLoadMoreLinks}
                disabled={loadingMoreLinks}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm disabled:opacity-50"
              >
                {loadingMoreLinks ? "Loading..." : "Show More"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center text-gray-500">
          No links found for this user
        </div>
      )}
    </div>
  );
};

export default LinksTable;
