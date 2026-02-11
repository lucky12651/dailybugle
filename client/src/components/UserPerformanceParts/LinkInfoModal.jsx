import React, { useEffect, useState } from "react";
import {
  renderTrafficChart,
  renderLocationDistributionChart,
  renderReferrerDistributionChart,
  renderOSDistributionChart,
  renderTrafficTypeChart,
} from "../../helpers/chartHelpers";
import Loader from "../Loader";
import {
  X,
  Globe,
  Link as LinkIcon,
  Monitor,
  Shield,
  Zap,
  Activity,
  BarChart2,
  ExternalLink,
} from "lucide-react";

const LinkInfoModal = ({
  selectedLink,
  selectedUser,
  setSelectedLink,
  linkTrafficPeriod,
  setLinkTrafficPeriod,
  linkTrafficData,
  loadingLinkTraffic,
  setLinkTrafficData,
  token,
}) => {
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

  useEffect(() => {
    if (selectedLink && selectedUser && token) {
      loadAdditionalAnalytics(linkTrafficPeriod);
    }
  }, [selectedLink, selectedUser, token, linkTrafficPeriod]);

  useEffect(() => {
    if (locationData)
      renderLocationDistributionChart("linkLocationChart", locationData);
  }, [locationData]);

  useEffect(() => {
    if (referrerData)
      renderReferrerDistributionChart("linkReferrerChart", referrerData);
  }, [referrerData]);

  useEffect(() => {
    if (osData) renderOSDistributionChart("linkOSChart", osData);
  }, [osData]);

  useEffect(() => {
    if (botData?.trafficTypeData)
      renderTrafficTypeChart("linkTrafficTypeChart", botData.trafficTypeData);
  }, [botData?.trafficTypeData]);

  const loadAdditionalAnalytics = async (period = "7d") => {
    setLoadingAdditionalData(true);
    try {
      const {
        fetchLinkLocationData,
        fetchLinkReferrerData,
        fetchLinkOSData,
        fetchLinkBotData,
      } = await import("../../helpers/apiHelpers");

      const [locationResult, referrerResult, osResult, botResult] =
        await Promise.all([
          fetchLinkLocationData(selectedLink.slug, selectedUser, token, period),
          fetchLinkReferrerData(selectedLink.slug, selectedUser, token, period),
          fetchLinkOSData(selectedLink.slug, selectedUser, token, period),
          fetchLinkBotData(selectedLink.slug, selectedUser, token, period),
        ]);

      if (locationResult.success) setLocationData(locationResult.data);
      if (referrerResult.success) setReferrerData(referrerResult.data);
      if (osResult.success) setOSData(osResult.data);
      if (botResult.success) setBotData(botResult.data);
    } catch (error) {
      console.error("Error loading additional analytics:", error);
    } finally {
      setLoadingAdditionalData(false);
    }
  };

  if (!selectedLink) return null;

  const total = botData?.totals?.total || 0;
  const human = botData?.totals?.human || 0;
  const bot = botData?.totals?.bot || 0;
  const humanPct = total ? Math.round((human / total) * 100) : 0;
  const botPct = total ? 100 - humanPct : 0;

  const threat =
    botPct < 20
      ? {
          label: "Safe",
          color: "text-green-500",
          bg: "bg-green-500/10",
          border: "border-green-500/20",
        }
      : botPct < 40
        ? {
            label: "Elevated",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
          }
        : {
            label: "Critical",
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
          };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-md px-6 py-4 border-b border-zinc-900 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-2xl">
              <BarChart2 className="text-green-500" size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                Traffic Analysis:{" "}
                <span className="text-green-500">/{selectedLink.slug}</span>
              </h4>
              <p className="text-xs text-zinc-500">
                User:{" "}
                <span className="text-zinc-300 font-medium">
                  {selectedUser}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedLink(null);
              setLinkTrafficData(null);
            }}
            className="p-2 hover:bg-zinc-900 rounded-xl transition-all text-zinc-500 hover:text-white border border-transparent hover:border-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Performance Chart */}
          <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                {["24h", "3d", "7d", "30d"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setLinkTrafficPeriod(period)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      linkTrafficPeriod === period
                        ? "bg-green-600 text-black shadow-lg"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {linkTrafficData && (
                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-xl">
                  <Activity size={18} className="text-green-500" />
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-white leading-none">
                      {linkTrafficData.total}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                      Total Views
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="h-[300px] relative">
              {loadingLinkTraffic ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader />
                </div>
              ) : linkTrafficData ? (
                <canvas id="linkPerformanceChart"></canvas>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500 italic text-sm">
                  No traffic data for this period
                </div>
              )}
            </div>
          </div>

          {/* Additional Analytics Grid */}
          {loadingAdditionalData ? (
            <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-12 flex flex-col items-center justify-center gap-4">
              <Loader />
              <p className="text-zinc-400 font-medium animate-pulse">
                Analyzing traffic data...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Location */}
              <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                  <Globe className="text-blue-500" size={18} />
                  Location Distribution
                </h3>
                <div className="h-[250px] relative">
                  {locationData ? (
                    <canvas id="linkLocationChart"></canvas>
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 italic text-xs">
                      No location data available
                    </div>
                  )}
                </div>
              </div>

              {/* Referrers */}
              <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                  <ExternalLink className="text-green-500" size={18} />
                  Referrer Sources
                </h3>
                <div className="h-[250px] relative">
                  {referrerData ? (
                    <canvas id="linkReferrerChart"></canvas>
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 italic text-xs">
                      No referrer data available
                    </div>
                  )}
                </div>
              </div>

              {/* OS */}
              <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                  <Monitor className="text-purple-500" size={18} />
                  Operating Systems
                </h3>
                <div className="h-[250px] relative">
                  {osData ? (
                    <canvas id="linkOSChart"></canvas>
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 italic text-xs">
                      No OS data available
                    </div>
                  )}
                </div>
              </div>

              {/* Traffic Quality */}
              <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-6 flex flex-col">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                  <Shield className="text-orange-500" size={18} />
                  Traffic Quality Analysis
                </h3>

                {botData ? (
                  <div className="flex-1 space-y-6">
                    <div className="h-[150px] relative">
                      <canvas id="linkTrafficTypeChart"></canvas>
                    </div>

                    <div
                      className={`p-4 rounded-xl border ${threat.bg} ${threat.border} flex items-center gap-4`}
                    >
                      <div
                        className={`p-2 rounded-lg bg-zinc-950 ${threat.color}`}
                      >
                        <Zap size={20} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${threat.color}`}>
                          Threat Level: {threat.label}
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Detected{" "}
                          <span className="text-red-500 font-bold">
                            {botPct}%
                          </span>{" "}
                          bot traffic
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-green-500">
                          Human {humanPct}%
                        </span>
                        <span className="text-red-500">Bot {botPct}%</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-green-500 transition-all duration-1000"
                          style={{ width: `${humanPct}%` }}
                        />
                        <div
                          className="h-full bg-red-500 transition-all duration-1000"
                          style={{ width: `${botPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-500 italic text-xs">
                    Quality metrics unavailable
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
