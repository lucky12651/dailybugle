import React from "react";
import Loader from "../Loader";

const TrafficChartsSection = ({
  trafficData,
  trafficPeriod,
  setTrafficPeriod,
  loadingTraffic,
  dailyTrafficData,
  loadingDailyTraffic,
}) => {
  return (
    <>
      <div className="grid grid-cols-1">
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-5 rounded-xl border border-cyan-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center">
              Traffic Over Time
            </h4>
            <div className="flex mt-2 sm:mt-0 space-x-2">
              {["24h", "3d", "7d", "30d"].map((period) => (
                <button
                  key={period}
                  onClick={() => setTrafficPeriod(period)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    {
                      "24h":
                        "bg-blue-100 text-blue-800 hover:bg-blue-200",
                      "3d": "bg-green-100 text-green-800 hover:bg-green-200",
                      "7d": "bg-purple-100 text-purple-800 hover:bg-purple-200",
                      "30d":
                        "bg-orange-100 text-orange-800 hover:bg-orange-200",
                    }[period] ||
                    "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  } ${
                    trafficPeriod === period
                      ? "ring-2 ring-offset-2 ring-current"
                      : ""
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            {loadingTraffic ? (
              <div className="flex items-center justify-center h-full">
                <Loader />
              </div>
            ) : trafficData ? (
              <>
                <div className="mb-2 text-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {trafficData.total}
                  </span>
                  <span className="text-gray-600 ml-2">
                    total clicks
                  </span>
                </div>
                <canvas
                  id="trafficChart"
                  width="400"
                  height="200"
                ></canvas>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No traffic data available
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center">
              Views Per Day (IST)
            </h4>
          </div>
          <div className="h-64">
            {loadingDailyTraffic ? (
              <div className="flex items-center justify-center h-full">
                <Loader />
              </div>
            ) : dailyTrafficData ? (
              <>
                <div className="mb-2 text-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {dailyTrafficData.total}
                  </span>
                  <span className="text-gray-600 ml-2">
                    total views (last 45 days)
                  </span>
                </div>
                <canvas
                  id="dailyViewsChart"
                  width="400"
                  height="200"
                ></canvas>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No daily views data available
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TrafficChartsSection;