import React from "react";

const StatsModal = ({
  showStats,
  statsData,
  loadingStats,
  closeStatsModal,
  osChartData,
  countryChartData,
}) => {
  return (
    showStats && (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[60vh] overflow-y-auto shadow-2xl">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Link Statistics
              </h3>
              <button
                onClick={closeStatsModal}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            {loadingStats ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Loading stats...</p>
              </div>
            ) : statsData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm text-blue-700">Total Clicks</p>
                    <p className="text-3xl font-bold text-blue-800">
                      {statsData.clicks}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm text-blue-700">Created</p>
                    <p className="text-sm text-blue-800">
                      {statsData.createdAt
                        ? new Date(statsData.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Click Details
                  </h4>
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
                            IP
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {statsData.clickDetails &&
                        statsData.clickDetails.length > 0 ? (
                          statsData.clickDetails.map((click, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                {click.timestamp
                                  ? new Date(click.timestamp).toLocaleString()
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
                                {click.ip || "N/A"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="5"
                              className="px-4 py-3 text-center text-sm text-gray-500"
                            >
                              No click data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="mt-6 space-y-6">
                  {osChartData && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="text-lg font-medium text-gray-800 mb-3">
                        OS Distribution
                      </h4>
                      <div className="flex justify-center">
                        <canvas id="osChart" width="200" height="200"></canvas>
                      </div>
                    </div>
                  )}

                  {countryChartData && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="text-lg font-medium text-gray-800 mb-3">
                        Country Distribution
                      </h4>
                      <div className="flex justify-center">
                        <canvas
                          id="countryChart"
                          width="200"
                          height="200"
                        ></canvas>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No stats data available</p>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default StatsModal;
