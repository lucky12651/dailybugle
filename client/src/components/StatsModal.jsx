import React, { useState, useEffect } from "react";
import {
  fetchTrafficStats,
  fetchClickDetails,
  fetchUserDailyTraffic,
  fetchChartDataWithPeriod,
} from "../helpers/apiHelpers";
import {
  renderTrafficChart,
  renderReferrerDistributionChart,
  renderDailyViewsBarChart,
  renderUserDistributionChart,
  renderBotCategoryChart,
  renderBotNameChart,
  renderTrafficTypeChart,
  renderOSDistributionChart,
  renderDeviceDistributionChart,
  renderLocationDistributionChart,
} from "../helpers/chartHelpers";
import Loader from "./Loader";
import StatsHeader from "./statsModal/StatsHeader";
import TrafficChartsSection from "./statsModal/TrafficChartsSection";
import DistributionChartsSection from "./statsModal/DistributionChartsSection";
import UserAnalyticsSection from "./statsModal/UserAnalyticsSection";
import BotAnalyticsSection from "./statsModal/BotAnalyticsSection";
import ClickDetailsSection from "./statsModal/ClickDetailsSection";
import UserTrafficModal from "./statsModal/UserTrafficModal";

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
  const [trafficPeriod, setTrafficPeriod] = useState("30d");
  const [loadingTraffic, setLoadingTraffic] = useState(false);

  const [dailyTrafficData, setDailyTrafficData] = useState(null);
  const [loadingDailyTraffic, setLoadingDailyTraffic] = useState(false);

  // Period-based chart data states
  const [periodChartData, setPeriodChartData] = useState({
    osChartData: null,
    deviceChartData: null,
    countryChartData: null,
    referrerChartData: null,
    botChartData: null,
    userChartData: null,
  });
  const [loadingPeriodCharts, setLoadingPeriodCharts] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userTrafficData, setUserTrafficData] = useState(null);
  const [loadingUserTraffic, setLoadingUserTraffic] = useState(false);

  const [clickDetails, setClickDetails] = useState([]);
  const [clickOffset, setClickOffset] = useState(0);
  const [loadingMoreClicks, setLoadingMoreClicks] = useState(false);
  const [hasMoreClicks, setHasMoreClicks] = useState(true);

  const CLICKS_PER_PAGE = 25;

  /* -------------------- EFFECTS -------------------- */
  useEffect(() => {
    if (statsData?.clickDetails) {
      setClickDetails(statsData.clickDetails);
      setClickOffset(statsData.clickDetails.length);
      setHasMoreClicks(statsData.clickDetails.length >= CLICKS_PER_PAGE);
    }
  }, [statsData]);

  // Load period-based click details when traffic period changes
  useEffect(() => {
    if (showStats && slug) {
      // Reset click details when period changes
      setClickDetails([]);
      setClickOffset(0);
      setHasMoreClicks(true);
      loadMoreClicks(true); // Load fresh data for new period
    }
  }, [trafficPeriod]);

  useEffect(() => {
    if (showStats && slug) fetchTrafficData();
  }, [showStats, slug, trafficPeriod]);

  useEffect(() => {
    if (showStats && slug) fetchDailyTrafficData();
  }, [showStats, slug]);

  useEffect(() => {
    if (showStats && slug) fetchPeriodChartData();
  }, [showStats, slug, trafficPeriod]);

  useEffect(() => {
    if (trafficData) renderTrafficChart("trafficChart", trafficData);
  }, [trafficData]);

  useEffect(() => {
    if (dailyTrafficData)
      renderDailyViewsBarChart("dailyViewsChart", dailyTrafficData);
  }, [dailyTrafficData]);

  useEffect(() => {
    console.log("OS Chart data changed:", periodChartData.osChartData);
    if (periodChartData.osChartData)
      renderOSDistributionChart("osChart", periodChartData.osChartData);
  }, [periodChartData.osChartData]);

  useEffect(() => {
    console.log("Device Chart data changed:", periodChartData.deviceChartData);
    if (periodChartData.deviceChartData)
      renderDeviceDistributionChart(
        "deviceChart",
        periodChartData.deviceChartData,
      );
  }, [periodChartData.deviceChartData]);

  useEffect(() => {
    if (periodChartData.countryChartData)
      renderLocationDistributionChart(
        "countryChart",
        periodChartData.countryChartData,
      );
  }, [periodChartData.countryChartData]);

  useEffect(() => {
    if (periodChartData.userChartData)
      renderUserDistributionChart("userChart", periodChartData.userChartData);
  }, [periodChartData.userChartData]);

  useEffect(() => {
    if (periodChartData.referrerChartData)
      renderReferrerDistributionChart(
        "referrerChart",
        periodChartData.referrerChartData,
      );
  }, [periodChartData.referrerChartData]);

  useEffect(() => {
    if (periodChartData.botChartData) {
      try {
        // Render traffic type chart (Human vs Bot)
        if (
          periodChartData.botChartData.trafficType &&
          periodChartData.botChartData.trafficType.labels &&
          periodChartData.botChartData.trafficType.data &&
          periodChartData.botChartData.trafficType.data.length > 0
        ) {
          renderTrafficTypeChart(
            "trafficTypeChart",
            periodChartData.botChartData.trafficType,
          );
        }

        // Render bot category chart
        if (
          periodChartData.botChartData.botCategories &&
          periodChartData.botChartData.botCategories.labels &&
          periodChartData.botChartData.botCategories.data &&
          periodChartData.botChartData.botCategories.data.length > 0
        ) {
          renderBotCategoryChart(
            "botCategoryChart",
            periodChartData.botChartData.botCategories,
          );
        }

        // Render bot name chart
        if (
          periodChartData.botChartData.botNames &&
          periodChartData.botChartData.botNames.labels &&
          periodChartData.botChartData.botNames.data &&
          periodChartData.botChartData.botNames.data.length > 0
        ) {
          renderBotNameChart(
            "botNameChart",
            periodChartData.botChartData.botNames,
          );
        }
      } catch (error) {
        console.error("Error rendering bot charts:", error);
      }
    }
  }, [periodChartData.botChartData]);

  /* -------------------- ACTIONS -------------------- */
  const fetchTrafficData = async () => {
    setLoadingTraffic(true);
    const res = await fetchTrafficStats(slug, trafficPeriod, token);
    if (res.success) setTrafficData(res.data);
    setLoadingTraffic(false);
  };

  const fetchDailyTrafficData = async () => {
    setLoadingDailyTraffic(true);
    const res = await fetchTrafficStats(slug, "45d", token);
    if (res.success) setDailyTrafficData(res.data);
    setLoadingDailyTraffic(false);
  };

  const fetchPeriodChartData = async () => {
    setLoadingPeriodCharts(true);
    const chartData = await fetchChartDataWithPeriod(
      slug,
      trafficPeriod,
      token,
    );
    console.log("Period chart data fetched:", chartData);
    setPeriodChartData(chartData);
    setLoadingPeriodCharts(false);
  };

  const loadMoreClicks = async (reset = false) => {
    if (loadingMoreClicks || !hasMoreClicks) return;
    setLoadingMoreClicks(true);

    const res = await fetchClickDetails(
      slug,
      CLICKS_PER_PAGE,
      reset ? 0 : clickOffset,
      token,
      trafficPeriod,
    );

    if (res.success && res.data.length) {
      if (reset) {
        // Reset with new data for period change
        setClickDetails(res.data);
        setClickOffset(res.data.length);
      } else {
        // Append data for pagination
        setClickDetails((prev) => [...prev, ...res.data]);
        setClickOffset((prev) => prev + res.data.length);
      }
      if (res.data.length < CLICKS_PER_PAGE) setHasMoreClicks(false);
    } else {
      setHasMoreClicks(false);
    }

    setLoadingMoreClicks(false);
  };

  const showUserTraffic = async (userId) => {
    setSelectedUser(userId);
    setLoadingUserTraffic(true);
    const res = await fetchUserDailyTraffic(slug, userId, token);
    if (res.success) setUserTrafficData(res.data);
    setLoadingUserTraffic(false);
  };

  const closeUserTraffic = () => {
    setSelectedUser(null);
    setUserTrafficData(null);
  };

  /* -------------------- RENDER -------------------- */
  if (!showStats) return null;
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
                <Loader />
                <p className="mt-2 text-gray-600">Loading stats...</p>
              </div>
            ) : statsData ? (
              <div className="space-y-6">
                <StatsHeader statsData={statsData} />

                <TrafficChartsSection
                  trafficData={trafficData}
                  trafficPeriod={trafficPeriod}
                  setTrafficPeriod={setTrafficPeriod}
                  loadingTraffic={loadingTraffic}
                  dailyTrafficData={dailyTrafficData}
                  loadingDailyTraffic={loadingDailyTraffic}
                />

                {/* Charts Section */}
                <div className="mt-6 space-y-6">
                  {loadingPeriodCharts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader />
                      <p className="ml-2 text-gray-600">
                        Loading chart data...
                      </p>
                    </div>
                  ) : (
                    <>
                      {(periodChartData.osChartData ||
                        periodChartData.deviceChartData ||
                        periodChartData.countryChartData ||
                        periodChartData.referrerChartData) && (
                        <DistributionChartsSection
                          osChartData={periodChartData.osChartData}
                          deviceChartData={periodChartData.deviceChartData}
                          countryChartData={periodChartData.countryChartData}
                          referrerChartData={periodChartData.referrerChartData}
                        />
                      )}

                      {/* User Analytics Section */}
                      {periodChartData.userChartData &&
                        periodChartData.userChartData.userDetails && (
                          <UserAnalyticsSection
                            userChartData={periodChartData.userChartData}
                            showUserTraffic={showUserTraffic}
                          />
                        )}

                      {/* Bot Analytics Section */}
                      {periodChartData.botChartData && (
                        <BotAnalyticsSection
                          botChartData={periodChartData.botChartData}
                        />
                      )}
                    </>
                  )}

                  {/* Traffic Over Time Chart */}
                </div>

                <ClickDetailsSection
                  clickDetails={clickDetails}
                  hasMoreClicks={hasMoreClicks}
                  loadingMoreClicks={loadingMoreClicks}
                  loadMoreClicks={loadMoreClicks}
                />
              </div>
            ) : (
              <p className="text-gray-600">No stats data available</p>
            )}
          </div>
        </div>

        <UserTrafficModal
          selectedUser={selectedUser}
          closeUserTraffic={closeUserTraffic}
          loadingUserTraffic={loadingUserTraffic}
          userTrafficData={userTrafficData}
        />
      </div>
    )
  );
};

export default StatsModal;
