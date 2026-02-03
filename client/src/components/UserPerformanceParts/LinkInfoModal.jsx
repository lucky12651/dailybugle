import React, { useEffect, useState } from "react";
import {
  renderTrafficChart,
  renderLocationDistributionChart,
  renderReferrerDistributionChart,
  renderOSDistributionChart,
  renderTrafficTypeChart,
} from "../../helpers/chartHelpers";
import Loader from "../Loader";

const LinkInfoModal = ({
  selectedLink,
  setSelectedLink,
  selectedUser,
  linkTrafficPeriod,
  setLinkTrafficPeriod,
  linkTrafficData,
  loadingLinkTraffic,
  setLinkTrafficData,
  token,
}) => {
  // State for additional analytics data
  const [locationData, setLocationData] = useState(null);
  const [referrerData, setReferrerData] = useState(null);
  const [osData, setOSData] = useState(null);
  const [botData, setBotData] = useState(null);
  const [loadingAdditionalData, setLoadingAdditionalData] = useState(false);

  useEffect(() => {
    if (linkTrafficData && selectedLink) {
      renderTrafficChart("linkPerformanceChart", linkTrafficData);
    }
  }, [linkTrafficData, selectedLink]);

  const total = botData?.totals?.total || 0;
  const human = botData?.totals?.human || 0;
  const bot = botData?.totals?.bot || 0;

  const humanPct = total ? Math.round((human / total) * 100) : 0;
  const botPct = total ? 100 - humanPct : 0;

  // Threat logic (opinionated thresholds)
  const threat =
    botPct < 20
      ? { label: "Safe", color: "green", bg: "bg-green-100" }
      : botPct < 40
        ? { label: "Elevated", color: "orange", bg: "bg-orange-100" }
        : { label: "Critical", color: "red", bg: "bg-red-100" };

  // Fetch additional analytics data when link is selected
  useEffect(() => {
    if (selectedLink && selectedUser && token) {
      loadAdditionalAnalytics(linkTrafficPeriod);
    }
  }, [selectedLink, selectedUser, token, linkTrafficPeriod]);

  // Render charts when data is available
  useEffect(() => {
    if (locationData) {
      renderLocationDistributionChart("linkLocationChart", locationData);
    }
  }, [locationData]);

  useEffect(() => {
    if (referrerData) {
      renderReferrerDistributionChart("linkReferrerChart", referrerData);
    }
  }, [referrerData]);

  useEffect(() => {
    if (osData) {
      renderOSDistributionChart("linkOSChart", osData);
    }
  }, [osData]);

  useEffect(() => {
    if (botData && botData.trafficTypeData) {
      renderTrafficTypeChart("linkTrafficTypeChart", botData.trafficTypeData);
    }
  }, [botData?.trafficTypeData]);

  // Function to load additional analytics data
  const loadAdditionalAnalytics = async (period = "7d") => {
    setLoadingAdditionalData(true);

    try {
      // Import the API functions
      const {
        fetchLinkLocationData,
        fetchLinkReferrerData,
        fetchLinkOSData,
        fetchLinkBotData,
      } = await import("../../helpers/apiHelpers");

      // Fetch all data in parallel
      const [locationResult, referrerResult, osResult, botResult] =
        await Promise.all([
          fetchLinkLocationData(selectedLink.slug, selectedUser, token, period),
          fetchLinkReferrerData(selectedLink.slug, selectedUser, token, period),
          fetchLinkOSData(selectedLink.slug, selectedUser, token, period),
          fetchLinkBotData(selectedLink.slug, selectedUser, token, period),
        ]);

      // Update state with fetched data
      if (locationResult.success) {
        setLocationData(locationResult.data);
      }

      if (referrerResult.success) {
        setReferrerData(referrerResult.data);
      }

      if (osResult.success) {
        setOSData(osResult.data);
      }

      if (botResult.success) {
        setBotData(botResult.data);
      }
    } catch (error) {
      console.error("Error loading additional analytics:", error);
    } finally {
      setLoadingAdditionalData(false);
    }
  };

  if (!selectedLink) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div>
            <h4 className="text-l font-medium text-gray-800">
              Traffic Analysis: /{selectedLink.slug}
            </h4>
            <p className="text-sm text-gray-500">
              Viewing engagement for{" "}
              <span className="font-semibold text-blue-600">
                {selectedUser}
              </span>
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedLink(null);
              setLinkTrafficData(null);
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Main Traffic Chart */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div className="flex bg-white/60 backdrop-blur-sm p-1 rounded-xl border border-white/40 shadow-sm w-fit">
                {["24h", "3d", "7d", "30d"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setLinkTrafficPeriod(period)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      linkTrafficPeriod === period
                        ? "bg-white text-blue-600 shadow-sm scale-105"
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/40"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {linkTrafficData && (
                <div className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-200">
                  <span className="text-2xl font-black">
                    {linkTrafficData.total}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider opacity-90">
                    Total
                    <br />
                    Views
                  </span>
                </div>
              )}
            </div>

            <div className="h-[235px] relative">
              {loadingLinkTraffic ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Loader />
                </div>
              ) : linkTrafficData ? (
                <canvas id="linkPerformanceChart"></canvas>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 italic"></div>
              )}
            </div>
          </div>

          {/* Loading Additional Data */}
          {loadingAdditionalData && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader />
                <p className="text-gray-600 font-medium mt-4">
                  Loading detailed analytics...
                </p>
              </div>
            </div>
          )}

          {/* Analytics Grid */}
          {!loadingAdditionalData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Location Distribution */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Location Distribution
                </h3>
                <div className="h-[200px] relative">
                  {locationData ? (
                    <canvas id="linkLocationChart"></canvas>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 italic">
                      No location data available
                    </div>
                  )}
                </div>
              </div>

              {/* Referrer Information */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Referrer Sources
                </h3>
                <div className="h-[200px] relative">
                  {referrerData ? (
                    <canvas id="linkReferrerChart"></canvas>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 italic">
                      No referrer data available
                    </div>
                  )}
                </div>
              </div>

              {/* OS Distribution */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Operating Systems
                </h3>
                <div className="h-[200px] relative">
                  {osData ? (
                    <canvas id="linkOSChart"></canvas>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 italic">
                      No OS data available
                    </div>
                  )}
                </div>
              </div>

              {/* Human/Bot Traffic Telemetry */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Traffic Type Analysis
                </h3>
                <div className=" relative">
                  {botData?.trafficTypeData ? (
                    <canvas id="linkTrafficTypeChart"></canvas>
                  ) : (
                    <></>
                  )}
                </div>

                {/* Bot Detection Summary */}
                {botData && botData.totals && (
                  <div className="mt-0 rounded-2xl  bg-white p-0 shadow-sm">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800">
                        Traffic Quality
                      </h3>
                      <span className="text-sm font-bold text-green-500">
                        Live
                      </span>
                    </div>

                    {/* Threat Level */}
                    <div
                      className={`mb-4 flex items-center gap-3 rounded-xl p-4 ${threat.bg}`}
                    >
                      <div
                        className={`h-10 w-10 rounded-full bg-${threat.color}-500 flex items-center justify-center text-[#f00] font-bold`}
                      >
                        !
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold text-${threat.color}-700`}
                        >
                          Threat Level: {threat.label}
                        </p>
                        <p className="text-xs text-gray-600">
                          Bot traffic at{" "}
                          <span className="font-bold text-red-500">
                            {botPct}%
                          </span>{" "}
                          of total requests
                        </p>
                      </div>
                    </div>

                    {/* Human Confidence */}
                    <div className="mb-5 rounded-xl bg-gradient-to-br from-green-50 to-white p-4">
                      <p className="text-xs text-gray-500">
                        Human Confidence Score
                      </p>
                      <p className="text-4xl font-extrabold text-green-600">
                        {humanPct}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Higher score indicates healthier traffic
                      </p>
                    </div>

                    {/* Traffic Split Bar */}
                    <div>
                      <div className="mb-2 flex justify-between text-xs text-gray-500">
                        <span>
                          Human{" "}
                          <span className="font-bold text-green-500">
                            {humanPct}%
                          </span>
                        </span>
                        <span>
                          Bot{" "}
                          <span className="font-bold text-red-500">
                            {botPct}%
                          </span>
                        </span>
                      </div>

                      <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-700"
                          style={{ width: `${humanPct}%` }}
                        />
                        <div
                          className="absolute right-0 top-0 h-full bg-red-500 transition-all duration-700"
                          style={{ width: `${botPct}%` }}
                        />
                      </div>

                      {/* Labels */}
                      {/* <div className="mt-3 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Human Traffic — {humanPct}%
                          </span>
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Bot Traffic — {botPct}%
                          </span>
                        </div>
                      </div> */}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkInfoModal;
