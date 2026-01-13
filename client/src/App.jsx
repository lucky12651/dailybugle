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
import StatsModal from "./components/StatsModal";

const App = () => {
  const [longUrl, setLongUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentLinks, setRecentLinks] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Set to true for dark mode only
  const [osChartData, setOsChartData] = useState(null);
  const [countryChartData, setCountryChartData] = useState(null);
  const [loadingCharts, setLoadingCharts] = useState({
    os: false,
    country: false,
  });
  const [activeTab, setActiveTab] = useState("link"); // 'link' or 'qr'
  const [qrUrl, setQrUrl] = useState("");

  // Load recent links on component mount
  useEffect(() => {
    const loadRecentLinks = async () => {
      const data = await fetchRecentLinks();
      setRecentLinks(data);
    };

    loadRecentLinks();
  }, []);

  // Render charts when chart data changes
  useEffect(() => {
    if (osChartData) {
      renderDoughnutChart("osChart", osChartData, defaultChartColors);
    }
  }, [osChartData]);

  useEffect(() => {
    if (countryChartData) {
      renderDoughnutChart("countryChart", countryChartData, defaultChartColors);
    }
  }, [countryChartData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShortUrl("");

    const result = await shortenUrl(longUrl, customSlug);

    if (result.success) {
      const data = result.data;
      setShortUrl(data.shortUrl);
      // Add to recent links
      setRecentLinks((prev) => [
        { ...data, createdAt: new Date().toISOString() },
        ...prev.slice(0, 9),
      ]);
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
    setCountryChartData(null);
  };

  const fetchChartStats = async (slug) => {
    setLoadingCharts((prev) => ({ ...prev, os: true, country: true }));

    const chartData = await fetchChartLinkStats(slug);

    setOsChartData(chartData.osChartData);
    setCountryChartData(chartData.countryChartData);

    setLoadingCharts({ os: false, country: false });
  };

  const fetchStats = async (slug) => {
    setLoadingStats(true);
    const statsResult = await fetchLinkStats(slug);

    if (statsResult.success) {
      setStatsData(statsResult.data);
      setShowStats(true);
      // Fetch chart data after showing the modal
      fetchChartLinkStats(slug);
    } else {
      setError(statsResult.error);
    }

    setLoadingStats(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-gray-800 font-sans">
      <Header />
      <main className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8">
            {/* Tabs */}
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Conditional Content based on active tab */}
            {activeTab === "link" ? (
              <LinkForm
                longUrl={longUrl}
                setLongUrl={setLongUrl}
                customSlug={customSlug}
                setCustomSlug={setCustomSlug}
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
          />
        </div>
      </main>

      <Footer />

      <StatsModal
        showStats={showStats}
        statsData={statsData}
        loadingStats={loadingStats}
        closeStatsModal={closeStatsModal}
        osChartData={osChartData}
        countryChartData={countryChartData}
      />
    </div>
  );
};

export default App;
