import React from "react";
import Loader from "../Loader";
import { Activity, BarChart } from "lucide-react";

const TrafficChartsSection = ({
  trafficData,
  trafficPeriod,
  setTrafficPeriod,
  loadingTraffic,
  dailyTrafficData,
  loadingDailyTraffic,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="text-green-500" size={20} />
            Traffic Over Time
          </h4>
          <div className="flex bg-black p-1 rounded-xl border border-zinc-800">
            {["24h", "3d", "7d", "30d"].map((period) => (
              <button
                key={period}
                onClick={() => setTrafficPeriod(period)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  trafficPeriod === period
                    ? "bg-green-600 text-black shadow-lg shadow-green-600/20"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72">
          {loadingTraffic ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader />
              <p className="text-sm text-zinc-500">Loading traffic data...</p>
            </div>
          ) : trafficData ? (
            <>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  {trafficData.total.toLocaleString()}
                </span>
                <span className="text-sm text-zinc-500 font-medium">
                  total clicks in period
                </span>
              </div>
              <div className="h-48">
                <canvas id="trafficChart"></canvas>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600 border-2 border-dashed border-zinc-800 rounded-xl">
              No traffic data available
            </div>
          )}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart className="text-green-500" size={20} />
            Views Per Day
          </h4>
        </div>
        <div className="h-72">
          {loadingDailyTraffic ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader />
              <p className="text-sm text-zinc-500">Loading daily views...</p>
            </div>
          ) : dailyTrafficData ? (
            <>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  {dailyTrafficData.total.toLocaleString()}
                </span>
                <span className="text-sm text-zinc-500 font-medium">
                  total views (last 45 days)
                </span>
              </div>
              <div className="h-48">
                <canvas id="dailyViewsChart"></canvas>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600 border-2 border-dashed border-zinc-800 rounded-xl">
              No daily data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrafficChartsSection;