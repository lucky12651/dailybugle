import React, { useState, useEffect } from "react";

// Import helper functions
import {
  fetchRecentLinks,
  shortenUrl,
  fetchLinkStats,
  fetchChartLinkStats,
} from "./helpers/apiHelpers";
import { copyToClipboard } from "./helpers/utils";
import {
  renderDoughnutChart,
  renderDeviceDistributionChart,
  renderOSDistributionChart,
  renderLocationDistributionChart,
  renderReferrerDistributionChart,
  renderTrafficTypeChart,
  renderBotCategoryChart,
  renderBotNameChart,
  defaultChartColors,
} from "./helpers/chartHelpers";
import { downloadQRCode } from "./helpers/uiHelpers";

// Import components
import Header from "./components/Header";
import Footer from "./components/Footer";
import Tabs from "./components/Tabs";
import LinkForm from "./components/LinkForm";
import QRCodeGenerator from "./components/QRCodeGenerator";
import RecentLinks from "./components/RecentLinks";
import Settings from "./components/Settings";
import StatsModal from "./components/StatsModal";
import Login from "./components/Login";
import UserPerformance from "./components/UserPerformance";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [longUrl, setLongUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [userId, setUserId] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentLinks, setRecentLinks] = useState([]);
  const [recentLinksOffset, setRecentLinksOffset] = useState(0);
  const [loadingMoreRecentLinks, setLoadingMoreRecentLinks] = useState(false);
  const [hasMoreRecentLinks, setHasMoreRecentLinks] = useState(true);
  const RECENT_LINKS_PER_PAGE = 25;
  const [showSettings, setShowSettings] = useState(false);

  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Set to true for dark mode only
  const [osChartData, setOsChartData] = useState(null);
  const [deviceChartData, setDeviceChartData] = useState(null);
  const [countryChartData, setCountryChartData] = useState(null);
  const [referrerChartData, setReferrerChartData] = useState(null);
  const [botChartData, setBotChartData] = useState(null);
  const [userChartData, setUserChartData] = useState(null);
  const [loadingCharts, setLoadingCharts] = useState({
    os: false,
    device: false,
    country: false,
  });
  const [activeTab, setActiveTab] = useState("link"); // 'link' or 'qr'
  const [qrUrl, setQrUrl] = useState("");

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("authToken", newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("authToken");
  };

  // Load recent links on component mount
  useEffect(() => {
    if (token) {
      const loadRecentLinks = async () => {
        const data = await fetchRecentLinks(RECENT_LINKS_PER_PAGE, 0, token);
        setRecentLinks(data);
        setRecentLinksOffset(data.length);
        if (data.length < RECENT_LINKS_PER_PAGE) {
          setHasMoreRecentLinks(false);
        } else {
          setHasMoreRecentLinks(true);
        }
      };

      loadRecentLinks();
    }
  }, [token]);

  const loadMoreRecentLinks = async () => {
    if (loadingMoreRecentLinks || !hasMoreRecentLinks) return;

    setLoadingMoreRecentLinks(true);
    const newLinks = await fetchRecentLinks(
      RECENT_LINKS_PER_PAGE,
      recentLinksOffset,
      token,
    );

    if (newLinks.length > 0) {
      setRecentLinks((prev) => [...prev, ...newLinks]);
      setRecentLinksOffset((prev) => prev + newLinks.length);
      if (newLinks.length < RECENT_LINKS_PER_PAGE) {
        setHasMoreRecentLinks(false);
      }
    } else {
      setHasMoreRecentLinks(false);
    }
    setLoadingMoreRecentLinks(false);
  };

  // Render charts when chart data changes
  useEffect(() => {
    if (osChartData) {
      renderOSDistributionChart("osChart", osChartData);
    }
  }, [osChartData]);

  useEffect(() => {
    if (deviceChartData) {
      renderDeviceDistributionChart("deviceChart", deviceChartData);
    }
  }, [deviceChartData]);

  useEffect(() => {
    if (countryChartData) {
      renderLocationDistributionChart("countryChart", countryChartData);
    }
  }, [countryChartData]);

  useEffect(() => {
    if (referrerChartData) {
      renderReferrerDistributionChart("referrerChart", referrerChartData);
    }
  }, [referrerChartData]);

  useEffect(() => {
    if (botChartData && botChartData.trafficType) {
      renderTrafficTypeChart("trafficTypeChart", botChartData.trafficType);
    }
  }, [botChartData?.trafficType]);

  useEffect(() => {
    if (botChartData && botChartData.botCategories) {
      renderBotCategoryChart("botCategoryChart", botChartData.botCategories);
    }
  }, [botChartData?.botCategories]);

  useEffect(() => {
    if (botChartData && botChartData.botNames) {
      renderBotNameChart("botNameChart", botChartData.botNames);
    }
  }, [botChartData?.botNames]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShortUrl("");

    const result = await shortenUrl(longUrl, customSlug, token);

    if (result.success) {
      const data = result.data;
      setShortUrl(data.shortUrl);
      // Add to recent links
      setRecentLinks((prev) => [
        { ...data, createdAt: new Date().toISOString() },
        ...prev,
      ]);
      setRecentLinksOffset((prev) => prev + 1);
      setLongUrl("");
      setCustomSlug("");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const closeStatsModal = () => {
    setShowStats(false);
    setStatsData(null);
    setOsChartData(null);
    setDeviceChartData(null);
    setCountryChartData(null);
    setReferrerChartData(null);
    setBotChartData(null);
    setUserChartData(null);
  };

  const fetchChartStats = async (slug) => {
    setLoadingCharts((prev) => ({
      ...prev,
      os: true,
      device: true,
      country: true,
    }));

    const chartData = await fetchChartLinkStats(slug, token);

    setOsChartData(chartData.osChartData);
    setDeviceChartData(chartData.deviceChartData);
    setCountryChartData(chartData.countryChartData);
    setReferrerChartData(chartData.referrerChartData);
    setBotChartData(chartData.botChartData);
    setUserChartData(chartData.userChartData);

    setLoadingCharts({ os: false, device: false, country: false });
  };

  const fetchStats = async (slug) => {
    setLoadingStats(true);
    const statsResult = await fetchLinkStats(slug, token);

    if (statsResult.success) {
      setStatsData(statsResult.data);
      setShowStats(true);
      // Fetch chart data after showing the modal
      fetchChartStats(slug);
    } else {
      setError(statsResult.error);
    }

    setLoadingStats(false);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-gray-800 font-sans">
      <Header />
      <div className="absolute top-6 right-6 flex gap-3">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all"
        >
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="text-white hover:text-gray-200 font-semibold"
        >
          Logout
        </button>
      </div>
      <main className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="w-full max-w-6xl">
          {showSettings ? (
            <Settings
              token={token}
              onToggle2FASetup={() => setShowSettings(false)}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
                  <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                  {activeTab === "link" ? (
                    <LinkForm
                      longUrl={longUrl}
                      setLongUrl={setLongUrl}
                      customSlug={customSlug}
                      setCustomSlug={setCustomSlug}
                      userId={userId}
                      setUserId={setUserId}
                      loading={loading}
                      handleSubmit={handleSubmit}
                      error={error}
                      shortUrl={shortUrl}
                      copiedIndex={copiedIndex}
                      setCopiedIndex={setCopiedIndex}
                      copyToClipboard={copyToClipboard}
                    />
                  ) : (
                    <QRCodeGenerator
                      qrUrl={qrUrl}
                      setQrUrl={setQrUrl}
                      downloadQRCode={downloadQRCode}
                    />
                  )}
                </div>
                <RecentLinks
                  recentLinks={recentLinks}
                  copiedIndex={copiedIndex}
                  setCopiedIndex={setCopiedIndex}
                  copyToClipboard={copyToClipboard}
                  fetchStats={fetchStats}
                  hasMore={hasMoreRecentLinks}
                  loadMore={loadMoreRecentLinks}
                  loadingMore={loadingMoreRecentLinks}
                />
              </div>
              <UserPerformance token={token} />
            </>
          )}
        </div>
      </main>

      <Footer />

      <StatsModal
        showStats={showStats}
        statsData={statsData}
        loadingStats={loadingStats}
        closeStatsModal={closeStatsModal}
        osChartData={osChartData}
        deviceChartData={deviceChartData}
        countryChartData={countryChartData}
        referrerChartData={referrerChartData}
        botChartData={botChartData}
        userChartData={userChartData}
        slug={statsData?.slug}
        token={token}
      />
    </div>
  );
};

export default App;
