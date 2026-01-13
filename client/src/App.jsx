import React, { useState, useEffect } from "react";
import { Chart as ChartJS } from "chart.js/auto";
import { QRCodeSVG } from "qrcode.react";

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
    fetchRecentLinks();
  }, []);

  // Render charts when chart data changes
  useEffect(() => {
    if (osChartData) {
      // Destroy existing chart if it exists
      const existingOsChart = ChartJS.getChart("osChart");
      if (existingOsChart) {
        existingOsChart.destroy();
      }

      const ctx = document.getElementById("osChart")?.getContext("2d");
      if (ctx) {
        new ChartJS(ctx, {
          type: "doughnut",
          data: {
            labels: osChartData.labels,
            datasets: [
              {
                data: osChartData.data,
                backgroundColor: [
                  "#3B82F6", // blue-500
                  "#EF4444", // red-500
                  "#10B981", // emerald-500
                  "#F59E0B", // amber-500
                  "#8B5CF6", // violet-500
                  "#EC4899", // pink-500
                  "#6EE7B7", // emerald-300
                  "#93C5FD", // blue-300
                  "#F87171", // red-300
                  "#A78BFA", // violet-300
                ],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  color: "#D1D5DB", // gray-300
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                backgroundColor: "#374151", // gray-700
                titleColor: "#F9FAFB", // gray-50
                bodyColor: "#D1D5DB", // gray-300
                borderColor: "#4B5563", // gray-600
                borderWidth: 1,
              },
            },
          },
        });
      }
    }
  }, [osChartData]);

  useEffect(() => {
    if (countryChartData) {
      // Destroy existing chart if it exists
      const existingCountryChart = ChartJS.getChart("countryChart");
      if (existingCountryChart) {
        existingCountryChart.destroy();
      }

      const ctx = document.getElementById("countryChart")?.getContext("2d");
      if (ctx) {
        new ChartJS(ctx, {
          type: "doughnut",
          data: {
            labels: countryChartData.labels,
            datasets: [
              {
                data: countryChartData.data,
                backgroundColor: [
                  "#3B82F6", // blue-500
                  "#EF4444", // red-500
                  "#10B981", // emerald-500
                  "#F59E0B", // amber-500
                  "#8B5CF6", // violet-500
                  "#EC4899", // pink-500
                  "#6EE7B7", // emerald-300
                  "#93C5FD", // blue-300
                  "#F87171", // red-300
                  "#A78BFA", // violet-300
                ],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  color: "#D1D5DB", // gray-300
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                backgroundColor: "#374151", // gray-700
                titleColor: "#F9FAFB", // gray-50
                bodyColor: "#D1D5DB", // gray-300
                borderColor: "#4B5563", // gray-600
                borderWidth: 1,
              },
            },
          },
        });
      }
    }
  }, [countryChartData]);

  const fetchRecentLinks = async () => {
    try {
      const response = await fetch("/api/recent");
      if (response.ok) {
        const data = await response.json();
        setRecentLinks(data);
      }
    } catch (err) {
      console.error("Error fetching recent links:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShortUrl("");

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          longUrl,
          customSlug: customSlug.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShortUrl(data.shortUrl);
        // Add to recent links
        setRecentLinks((prev) => [
          { ...data, createdAt: new Date().toISOString() },
          ...prev.slice(0, 9),
        ]);
        setLongUrl("");
        setCustomSlug("");
      } else {
        setError(data.error || "An error occurred");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const closeStatsModal = () => {
    setShowStats(false);
    setStatsData(null);
    setOsChartData(null);
    setCountryChartData(null);
  };

  const fetchChartStats = async (slug) => {
    // Fetch OS distribution
    setLoadingCharts((prev) => ({ ...prev, os: true }));
    try {
      const osResponse = await fetch(`/api/stats/${slug}/os`);
      const osData = await osResponse.json();

      if (osResponse.ok) {
        setOsChartData(osData);
      }
    } catch (err) {
      console.error("Error fetching OS stats:", err);
    } finally {
      setLoadingCharts((prev) => ({ ...prev, os: false }));
    }

    // Fetch country distribution
    setLoadingCharts((prev) => ({ ...prev, country: true }));
    try {
      const countryResponse = await fetch(`/api/stats/${slug}/country`);
      const countryData = await countryResponse.json();

      if (countryResponse.ok) {
        setCountryChartData(countryData);
      }
    } catch (err) {
      console.error("Error fetching country stats:", err);
    } finally {
      setLoadingCharts((prev) => ({ ...prev, country: false }));
    }
  };

  const fetchStats = async (slug) => {
    setLoadingStats(true);
    try {
      const response = await fetch(`/api/stats/${slug}`);
      const data = await response.json();

      if (response.ok) {
        setStatsData(data);
        setShowStats(true);
        // Fetch chart data after showing the modal
        fetchChartStats(slug);
      } else {
        setError(data.error || "Failed to fetch stats");
      }
    } catch (err) {
      setError("Network error occurred while fetching stats");
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-gray-800 font-sans">
      <header className="bg-transparent">
        <div className="max-w-[800px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            URL Shortener
          </h1>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-8">
            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setActiveTab("link")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 ${
                    activeTab === "link"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Short Link
                </button>
                <button
                  onClick={() => setActiveTab("qr")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors duration-200 ${
                    activeTab === "qr"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                  QR Code
                </button>
              </div>
            </div>

            {/* Conditional Content based on active tab */}
            {activeTab === "link" ? (
              <>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Shorten a long link
                    </h2>
                    <p className="text-gray-600 text-sm mb-6">
                      No credit card required.
                    </p>

                    <label
                      htmlFor="longUrl"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Paste your long link here
                    </label>
                    <input
                      type="url"
                      id="longUrl"
                      value={longUrl}
                      onChange={(e) => setLongUrl(e.target.value)}
                      placeholder="https://example.com/my-long-url"
                      required
                      className="w-full px-6 py-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customSlug"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Custom Alias (Optional)
                    </label>
                    <input
                      type="text"
                      id="customSlug"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      placeholder="my-custom-slug"
                      className="w-full px-6 py-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex justify-start">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Processing..." : "Get your link for free →"}
                    </button>
                  </div>
                </form>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                    {error}
                  </div>
                )}

                {shortUrl && (
                  <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-800 truncate">
                          Your shortened link:
                        </p>
                        <p className="text-sm text-blue-700 truncate">
                          {shortUrl}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(shortUrl, -1)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        {copiedIndex === -1 ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* QR Code Tab Content */
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Generate QR Code
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Create a QR code for any URL
                </p>

                <label
                  htmlFor="qrUrl"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter URL to generate QR code
                </label>
                <input
                  type="url"
                  id="qrUrl"
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                  placeholder="https://example.com/my-url"
                  className="w-full px-6 py-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-500 transition-all duration-200"
                />

                {qrUrl && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <QRCodeSVG
                        value={qrUrl}
                        size={200}
                        level="H"
                        includeMargin={true}
                        id="qr-code-svg"
                      />
                    </div>
                    <button
                      onClick={() => {
                        // Get the SVG element and convert to image for download
                        const qrCodeElement =
                          document.querySelector("#qr-code-svg");
                        if (qrCodeElement) {
                          const svgData = new XMLSerializer().serializeToString(
                            qrCodeElement,
                          );
                          const canvas = document.createElement("canvas");
                          const ctx = canvas.getContext("2d");
                          const img = new Image();

                          canvas.width = 200;
                          canvas.height = 200;

                          img.onload = () => {
                            ctx.fillStyle = "white";
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(img, 0, 0);

                            const pngUrl = canvas.toDataURL("image/png");
                            const downloadLink = document.createElement("a");
                            downloadLink.href = pngUrl;
                            downloadLink.download = "qr-code.png";
                            downloadLink.click();
                          };

                          img.src =
                            "data:image/svg+xml;base64," + btoa(svgData);
                        }
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                      Download QR Code
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Links Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Recent Links
            </h2>
            {recentLinks.length > 0 ? (
              <div className="bg-gray-50 rounded-xl max-h-[300px] overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {recentLinks.map((link, index) => (
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
                              onClick={() =>
                                copyToClipboard(link.shortUrl, index)
                              }
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
                <p className="text-gray-500">No recent links yet</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-transparent py-6">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            URL Shortener Application &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      {/* Stats Modal */}
      {showStats && (
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
                                  {click.deviceInfo
                                    ? click.deviceInfo.os
                                    : "N/A"}
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
                          <canvas
                            id="osChart"
                            width="200"
                            height="200"
                          ></canvas>
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
      )}
    </div>
  );
};

export default App;
