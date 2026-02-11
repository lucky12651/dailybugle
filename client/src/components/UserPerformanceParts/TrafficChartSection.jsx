import React, { useEffect } from "react";
import { renderTrafficChart } from "../../helpers/chartHelpers";
import Loader from "../Loader";
import { LineChart, Activity, Calendar } from "lucide-react";

const TrafficChartSection = ({
  trafficPeriod,
  setTrafficPeriod,
  trafficData,
  loadingTraffic,
}) => {
  useEffect(() => {
    if (trafficData) {
      renderTrafficChart("userPerformanceChart", trafficData);
    }
  }, [trafficData]);

  return (
    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <LineChart className="text-blue-500" size={18} />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-widest">
            Traffic Over Time
          </h4>
        </div>

        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          {["24h", "3d", "7d", "30d"].map((period) => (
            <button
              key={period}
              onClick={() => setTrafficPeriod(period)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                trafficPeriod === period
                  ? "bg-blue-600 text-black shadow-lg"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[250px] relative">
        {loadingTraffic ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Loader />
            <p className="text-zinc-500 text-xs font-bold animate-pulse">Syncing analytics...</p>
          </div>
        ) : trafficData ? (
          <div className="space-y-4 h-full">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-green-500" />
              <span className="text-2xl font-black text-white">
                {trafficData.total}
              </span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1.5">
                Total Views
              </span>
            </div>
            <div className="h-[180px]">
              <canvas id="userPerformanceChart"></canvas>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600 italic text-sm">
            No traffic data available for this range
          </div>
        )}
      </div>
    </div>
  );
};

export default TrafficChartSection;
