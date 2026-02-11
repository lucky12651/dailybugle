import React, { useEffect } from "react";
import { renderDailyViewsBarChart } from "../../helpers/chartHelpers";
import { X, TrendingUp, CheckCircle, BarChart3, Calendar } from "lucide-react";
import Loader from "../Loader";

const DailyViewsModal = ({
  dailyLink,
  setDailyLink,
  dailyTrafficData,
  loadingDailyTraffic,
  setDailyTrafficData,
  selectedUser,
}) => {
  useEffect(() => {
    if (dailyTrafficData && dailyLink) {
      renderDailyViewsBarChart("dailyViewsChart", dailyTrafficData);
    }
  }, [dailyTrafficData, dailyLink]);

  if (!dailyLink) return null;

  const peakViews =
    dailyTrafficData &&
    dailyTrafficData.data &&
    dailyTrafficData.data.length > 0
      ? Math.max(...dailyTrafficData.data)
      : 0;
  const consistency =
    dailyTrafficData &&
    dailyTrafficData.data &&
    dailyTrafficData.data.length > 0
      ? (
          (dailyTrafficData.data.filter((v) => v > 0).length /
            dailyTrafficData.data.length) *
          100
        ).toFixed(0)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-md px-6 py-4 border-b border-zinc-900 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <BarChart3 className="text-emerald-500" size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                Daily Engagement:{" "}
                <span className="text-emerald-500">/{dailyLink.slug}</span>
              </h4>
              <p className="text-xs text-zinc-500">
                30-day view distribution for{" "}
                <span className="text-zinc-300 font-medium">
                  {selectedUser}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setDailyLink(null);
              setDailyTrafficData(null);
            }}
            className="p-2 hover:bg-zinc-900 rounded-xl transition-all text-zinc-500 hover:text-white border border-transparent hover:border-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Chart Section */}
          <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg">
                <Calendar size={14} className="text-emerald-500" />
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  Last 30 Days
                </span>
              </div>

              {dailyTrafficData && (
                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-xl">
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-black text-white leading-none">
                      {dailyTrafficData.total}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                      Period Views
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="h-[300px] relative">
              {loadingDailyTraffic ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <Loader />
                  <p className="text-emerald-500 text-sm font-bold animate-pulse">
                    Generating Analytics...
                  </p>
                </div>
              ) : dailyTrafficData ? (
                <canvas id="dailyViewsChart"></canvas>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500 italic text-sm">
                  No daily data available for this link
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-900 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  Peak Daily Views
                </p>
                <p className="text-3xl font-black text-white">{peakViews}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-900 flex items-center justify-between group hover:border-blue-500/30 transition-all">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  Consistency
                </p>
                <p className="text-3xl font-black text-white">{consistency}%</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyViewsModal;
