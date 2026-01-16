import React, { useState, useEffect } from "react";
import { fetchTrafficStats } from "../helpers/apiHelpers";
import {
  renderTrafficChart,
  renderReferrerDistributionChart,
} from "../helpers/chartHelpers";

const StatsModal = ({
  showStats,
  statsData,
  loadingStats,
  closeStatsModal,
  osChartData,
  deviceChartData,
  countryChartData,
  referrerChartData,
  botChartData,
  slug,
}) => {
  const [trafficData, setTrafficData] = useState(null);
  const [trafficPeriod, setTrafficPeriod] = useState("7d");
  const [loadingTraffic, setLoadingTraffic] = useState(false);

  // Fetch traffic data when modal opens or period changes
  useEffect(() => {
    if (showStats && slug) {
      fetchTrafficData();
    }
  }, [showStats, slug, trafficPeriod]);

  // Render traffic chart when data changes
  useEffect(() => {
    if (trafficData) {
      renderTrafficChart("trafficChart", trafficData);
    }
  }, [trafficData]);

  // Render referrer chart when data changes
  useEffect(() => {
    if (referrerChartData) {
      renderReferrerDistributionChart("referrerChart", referrerChartData);
    }
  }, [referrerChartData]);

  const fetchTrafficData = async () => {
    setLoadingTraffic(true);
    const result = await fetchTrafficStats(slug, trafficPeriod);
    if (result.success) {
      setTrafficData(result.data);
    }
    setLoadingTraffic(false);
  };
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
                <div className="grid grid-cols-1">
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-5 rounded-xl border border-cyan-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        Traffic Over Time
                      </h4>
                      <div className="flex mt-2 sm:mt-0 space-x-2">
                        {["24h", "3d", "7d", "30d"].map((period) => (
                          <button
                            key={period}
                            onClick={() => setTrafficPeriod(period)}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                              {
                                "24h":
                                  "bg-blue-100 text-blue-800 hover:bg-blue-200",
                                "3d": "bg-green-100 text-green-800 hover:bg-green-200",
                                "7d": "bg-purple-100 text-purple-800 hover:bg-purple-200",
                                "30d":
                                  "bg-orange-100 text-orange-800 hover:bg-orange-200",
                              }[period] ||
                              "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            } ${
                              trafficPeriod === period
                                ? "ring-2 ring-offset-2 ring-current"
                                : ""
                            }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-64">
                      {loadingTraffic ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : trafficData ? (
                        <>
                          <div className="mb-2 text-center">
                            <span className="text-2xl font-bold text-blue-600">
                              {trafficData.total}
                            </span>
                            <span className="text-gray-600 ml-2">
                              total clicks
                            </span>
                          </div>
                          <canvas
                            id="trafficChart"
                            width="400"
                            height="200"
                          ></canvas>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          No traffic data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="mt-6 space-y-6">
                  {(osChartData ||
                    deviceChartData ||
                    countryChartData ||
                    referrerChartData) && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {osChartData && (
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                              OS Distribution
                            </h4>
                            <div className="flex justify-center">
                              <canvas
                                id="osChart"
                                width="200"
                                height="200"
                              ></canvas>
                            </div>
                          </div>
                        )}

                        {deviceChartData && (
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100 shadow-sm">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                              Device Distribution
                            </h4>
                            <div className="flex justify-center">
                              <canvas
                                id="deviceChart"
                                width="200"
                                height="200"
                              ></canvas>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {countryChartData && (
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100 shadow-sm">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                              Location Distribution
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

                        {referrerChartData && (
                          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl border border-yellow-100 shadow-sm">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                              Referrer Distribution
                            </h4>
                            <div className="flex justify-center">
                              <canvas
                                id="referrerChart"
                                width="200"
                                height="200"
                              ></canvas>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bot Analytics Section */}
                  {botChartData && (
                    <div className="space-y-6">
                      {/* Human vs Bot Traffic */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-5 rounded-xl border border-red-100 shadow-sm h-full">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                              Human vs Bot
                            </h4>
                            <div className="flex justify-center">
                              <canvas
                                id="trafficTypeChart"
                                width="150"
                                height="150"
                              ></canvas>
                            </div>

                            <div className="mt-4 flex justify-center space-x-8">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                  {botChartData.totals.human}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Human Users
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  {botChartData.totals.bot}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Bots
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bot Categories */}
                        {botChartData.botCategories && (
                          <div className="md:col-span-1">
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-100 shadow-sm h-full">
                              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                Bot Categories
                              </h4>
                              <div className="flex justify-center">
                                <canvas
                                  id="botCategoryChart"
                                  width="150"
                                  height="150"
                                ></canvas>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Specific Bots */}
                        {botChartData.botNames && (
                          <div className="md:col-span-1">
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-100 shadow-sm h-full">
                              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                Top Bots
                              </h4>
                              <div className="flex justify-center">
                                <canvas
                                  id="botNameChart"
                                  width="150"
                                  height="150"
                                ></canvas>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Traffic Over Time Chart */}
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
                            Location
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
                                {click.location || "N/A"}
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
