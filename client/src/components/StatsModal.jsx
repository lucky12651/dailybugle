import React, { useState, useEffect } from "react";
import {
  fetchTrafficStats,
  fetchClickDetails,
  fetchUserDailyTraffic,
} from "../helpers/apiHelpers";
import {
  renderTrafficChart,
  renderReferrerDistributionChart,
  renderDailyViewsBarChart,
  renderUserDistributionChart,
  renderBotCategoryChart,
  renderBotNameChart,
  renderTrafficTypeChart,
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
  userChartData,
  slug,
  token,
}) => {
  const [trafficData, setTrafficData] = useState(null);
  const [trafficPeriod, setTrafficPeriod] = useState("7d");
  const [loadingTraffic, setLoadingTraffic] = useState(false);
  const [dailyTrafficData, setDailyTrafficData] = useState(null);
  const [loadingDailyTraffic, setLoadingDailyTraffic] = useState(false);

  // User Traffic State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTrafficData, setUserTrafficData] = useState(null);
  const [loadingUserTraffic, setLoadingUserTraffic] = useState(false);

  // Pagination state for click details
  const [clickDetails, setClickDetails] = useState([]);
  const [clickOffset, setClickOffset] = useState(0);
  const [loadingMoreClicks, setLoadingMoreClicks] = useState(false);
  const [hasMoreClicks, setHasMoreClicks] = useState(true);
  const CLICKS_PER_PAGE = 25;

  // Initialize click details when statsData changes
  useEffect(() => {
    if (statsData && statsData.clickDetails) {
      setClickDetails(statsData.clickDetails);
      setClickOffset(statsData.clickDetails.length);
      // If initial load returned less than limit, we assume no more data
      if (statsData.clickDetails.length < CLICKS_PER_PAGE) {
        setHasMoreClicks(false);
      } else {
        setHasMoreClicks(true);
      }
    }
  }, [statsData]);

  const loadMoreClicks = async () => {
    if (loadingMoreClicks || !hasMoreClicks) return;

    setLoadingMoreClicks(true);
    const result = await fetchClickDetails(
      slug,
      CLICKS_PER_PAGE,
      clickOffset,
      token,
    );

    if (result.success) {
      const newClicks = result.data;
      if (newClicks.length > 0) {
        setClickDetails((prev) => [...prev, ...newClicks]);
        setClickOffset((prev) => prev + newClicks.length);
        if (newClicks.length < CLICKS_PER_PAGE) {
          setHasMoreClicks(false);
        }
      } else {
        setHasMoreClicks(false);
      }
    }
    setLoadingMoreClicks(false);
  };

  // Fetch traffic data when modal opens or period changes
  useEffect(() => {
    if (showStats && slug) {
      fetchTrafficData();
    }
  }, [showStats, slug, trafficPeriod]);
  useEffect(() => {
    if (showStats && slug) {
      fetchDailyTrafficData();
    }
  }, [showStats, slug]);

  // Render user chart when data changes
  useEffect(() => {
    if (userChartData) {
      renderUserDistributionChart("userChart", userChartData);
    }
  }, [userChartData]);

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

  useEffect(() => {
    if (dailyTrafficData) {
      renderDailyViewsBarChart("dailyViewsChart", dailyTrafficData);
    }
  }, [dailyTrafficData]);

  useEffect(() => {
    if (userTrafficData) {
      renderDailyViewsBarChart("userDailyViewsChart", userTrafficData);
    }
  }, [userTrafficData]);

  const showUserTraffic = async (userId) => {
    setSelectedUser(userId);
    setLoadingUserTraffic(true);
    const result = await fetchUserDailyTraffic(slug, userId, token);
    if (result.success) {
      setUserTrafficData(result.data);
    }
    setLoadingUserTraffic(false);
  };

  const closeUserTraffic = () => {
    setSelectedUser(null);
    setUserTrafficData(null);
  };

  const fetchTrafficData = async () => {
    setLoadingTraffic(true);
    const result = await fetchTrafficStats(slug, trafficPeriod, token);
    if (result.success) {
      setTrafficData(result.data);
    }
    setLoadingTraffic(false);
  };
  const fetchDailyTrafficData = async () => {
    setLoadingDailyTraffic(true);
    const result = await fetchTrafficStats(slug, "45d", token);
    if (result.success) {
      setDailyTrafficData(result.data);
    }
    setLoadingDailyTraffic(false);
  };
  return (
    showStats && (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[98vh] overflow-y-auto shadow-2xl">
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
                        ? new Date(statsData.createdAt).toLocaleString(
                            "en-IN",
                            {
                              timeZone: "Asia/Kolkata",
                            },
                          )
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
                <div className="grid grid-cols-1">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                        Views Per Day (IST)
                      </h4>
                    </div>
                    <div className="h-64">
                      {loadingDailyTraffic ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : dailyTrafficData ? (
                        <>
                          <div className="mb-2 text-center">
                            <span className="text-2xl font-bold text-blue-600">
                              {dailyTrafficData.total}
                            </span>
                            <span className="text-gray-600 ml-2">
                              total views (last 45 days)
                            </span>
                          </div>
                          <canvas
                            id="dailyViewsChart"
                            width="400"
                            height="200"
                          ></canvas>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          No daily views data available
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

                  {/* User Analytics Section */}
                  {userChartData && userChartData.userDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                      {/* Top Users Chart */}
                      <div className="bg-gradient-to-br from-teal-50 to-green-50 p-5 rounded-xl border border-teal-100 shadow-sm h-full min-h-[400px]">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          Top Users
                        </h4>
                        <div className="flex justify-center h-[300px] items-center">
                          <canvas
                            id="userChart"
                            width="250"
                            height="250"
                          ></canvas>
                        </div>
                      </div>

                      {/* User Details List */}
                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-full min-h-[400px] flex flex-col">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          User Details
                        </h4>
                        <div className="overflow-y-auto flex-1 pr-2 max-h-[320px]">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                  User ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                  Views
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                  Last Active
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {userChartData.userDetails.map((user, idx) => (
                                <tr key={idx}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">
                                    {user.userId}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {user.views}
                                  </td>
                                  <td className="px-1 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {user.lastFetched
                                      ? new Date(
                                          user.lastFetched,
                                        ).toLocaleDateString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                        }) +
                                        ", " +
                                        new Date(
                                          user.lastFetched,
                                        ).toLocaleTimeString("en-IN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "N/A"}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">
                                    <button
                                      onClick={() =>
                                        showUserTraffic(user.userId)
                                      }
                                      className="text-blue-600 hover:text-blue-800  font-medium"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24px"
                                        viewBox="0 -960 960 960"
                                        width="24px"
                                        fill="#0000F5"
                                      >
                                        <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
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
              </div>
            ) : (
              <p className="text-gray-600">No stats data available</p>
            )}
          </div>
        </div>

        {/* User Traffic Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] ">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden h-[400px]">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 border-b border-indigo-100 flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-800">
                  User Traffic:{" "}
                  <span className="text-blue-600">{selectedUser}</span>
                </h4>
                <button
                  onClick={closeUserTraffic}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <div className="h-64">
                  {loadingUserTraffic ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : userTrafficData ? (
                    <>
                      <div className="mb-2 text-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {userTrafficData.total}
                        </span>
                        <span className="text-gray-600 ml-2">
                          views (last 30 days)
                        </span>
                      </div>
                      <canvas
                        id="userDailyViewsChart"
                        width="400"
                        height="200"
                      ></canvas>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No traffic data available for this user
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default StatsModal;
