import React, { useEffect, useState } from "react";
import { fetchGlobalTraffic } from "../../helpers/apiHelpers";
import {
  renderTrafficChart,
  renderDailyViewsBarChart,
} from "../../helpers/chartHelpers";
import Loader from "../Loader";
import { Activity, BarChart2 } from "lucide-react";

const OverallStatsSection = ({ token }) => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatsData();
  }, [token]);

  const loadStatsData = async () => {
    setLoading(true);
    // Fetch global data for the last 120 days
    const result = await fetchGlobalTraffic("120d", token);
    if (result.success) {
      setStatsData(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (statsData) {
      // Render Line Chart for Overall Views Trend
      renderTrafficChart("overallViewsChart", statsData);
      // Render Bar Chart for Daily Views
      renderDailyViewsBarChart("dailyViewsBarChart", statsData);
    }
  }, [statsData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-900 h-[300px] flex items-center justify-center">
          <Loader />
        </div>
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-900 h-[300px] flex items-center justify-center">
          <Loader />
        </div>
      </div>
    );
  }

  if (!statsData) return null;

  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* Overall Views Graph (Line Chart) */}
      <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-900">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Activity className="text-purple-500" size={18} />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest">
              Website Overall Views (Last 120 Days)
            </h4>
            {statsData?.total > 0 && (
              <span className="text-sm text-zinc-100 font-medium mt-1">
                Total: {statsData.total.toLocaleString()} views
              </span>
            )}
          </div>
        </div>
        <div className="h-[250px]">
          <canvas id="overallViewsChart"></canvas>
        </div>
      </div>

      {/* Per Day Views Graph (Bar Chart) */}
      <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-900">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <BarChart2 className="text-blue-500" size={18} />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest">
              Website Daily Views (Bar Chart)
            </h4>
            {statsData?.total > 0 && (
              <span className="text-sm text-zinc-100 font-medium mt-1">
                Total: {statsData.total.toLocaleString()} views
              </span>
            )}
          </div>
        </div>
        <div className="h-[250px]">
          <canvas id="dailyViewsBarChart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default OverallStatsSection;
