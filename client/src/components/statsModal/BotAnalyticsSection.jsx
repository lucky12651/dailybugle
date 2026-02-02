import React from "react";

const BotAnalyticsSection = ({ botChartData }) => {
  if (!botChartData) return null;

  const total = botChartData?.totals?.total || 0;
  const human = botChartData?.totals?.human || 0;
  const bot = botChartData?.totals?.bot || 0;

  const humanPct = total ? Math.round((human / total) * 100) : 0;
  const botPct = total ? Math.round((bot / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Human vs Bot */}
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200 h-full">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-800">
              Human vs Bot Traffic
            </h4>
            <span className="text-xs font-bold text-green-500">
              Live
            </span>
          </div>

          {/* Chart */}
          <div className="flex justify-center">
            <canvas
              id="trafficTypeChart"
              width="160"
              height="160"
            />
          </div>

          {/* Totals */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-green-600">
                {botChartData.totals.human}
              </p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-600">
                {botChartData.totals.bot}
              </p>
            </div>
          </div>
          {/* Percent Summary */}
          <div className="mb-3 flex justify-between text-xs text-gray-600">
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

          {/* Mini Split Bar */}
          <div className="relative mb-5 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-700"
              style={{ width: `${humanPct}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-red-500 transition-all duration-700"
              style={{ width: `${botPct}%` }}
            />
          </div>
        </div>

        {/* Bot Categories */}
        {botChartData.botCategories && (
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200 h-full">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-800">
                Bot Categories
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Classification of automated traffic
              </p>
            </div>

            <div className="flex justify-center">
              <canvas
                id="botCategoryChart"
                width="160"
                height="160"
              />
            </div>
          </div>
        )}

        {/* Top Bots */}
        {botChartData.botNames && (
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200 h-full">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-800">
                Top Bots
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Most frequent automated agents
              </p>
            </div>

            <div className="flex justify-center">
              <canvas
                id="botNameChart"
                width="160"
                height="160"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotAnalyticsSection;