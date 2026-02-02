import React from "react";

const ClickDetailsSection = ({
  clickDetails,
  hasMoreClicks,
  loadingMoreClicks,
  loadMoreClicks,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800">
          Click Details
        </h4>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-gray-200 bg-white rounded shadow-sm"></div>
            <span className="text-gray-600">User</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-yellow-200 bg-yellow-50 rounded shadow-sm"></div>
            <span className="text-gray-600">Bot</span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Device
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                OS
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Browser
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                User
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clickDetails && clickDetails.length > 0 ? (
              clickDetails.map((click, idx) => (
                <tr
                  key={idx}
                  className={click.isBot ? "bg-yellow-50" : ""}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {click.timestamp
                      ? new Date(click.timestamp).toLocaleString(
                          "en-IN",
                          { timeZone: "Asia/Kolkata" },
                        )
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {click.deviceInfo
                      ? click.deviceInfo.deviceType
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {click.deviceInfo ? click.deviceInfo.os : "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {click.deviceInfo
                      ? click.deviceInfo.browser
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {click.location || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {click.userId || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-3 text-center text-sm text-gray-500"
                >
                  No click data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {hasMoreClicks && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={loadMoreClicks}
            disabled={loadingMoreClicks}
            className="px-6 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {loadingMoreClicks ? "Loading..." : "Show More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ClickDetailsSection;