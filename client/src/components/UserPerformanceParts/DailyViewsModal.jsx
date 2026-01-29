import React, { useEffect } from "react";
import { renderDailyViewsBarChart } from "../../helpers/chartHelpers";

const DailyViewsModal = ({
  dailyLink,
  setDailyLink,
  selectedUser,
  dailyTrafficData,
  loadingDailyTraffic,
  setDailyTrafficData
}) => {
  useEffect(() => {
    if (dailyTrafficData && dailyLink) {
      renderDailyViewsBarChart("dailyViewsBarChart", dailyTrafficData);
    }
  }, [dailyTrafficData, dailyLink]);

  if (!dailyLink) return null;

  const peakViews = dailyTrafficData ? Math.max(...dailyTrafficData.data) : "0";
  const consistency = dailyTrafficData
    ? ((dailyTrafficData.data.filter((v) => v > 0).length / 30) * 100).toFixed(0)
    : "0";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div>
            <h4 className="text-xl font-bold text-gray-800">
              Daily Engagement: /{dailyLink.slug}
            </h4>
            <p className="text-sm text-gray-500">
              30-day view distribution for{" "}
              <span className="font-semibold text-emerald-600">
                {selectedUser}
              </span>
            </p>
          </div>
          <button
            onClick={() => {
              setDailyLink(null);
              setDailyTrafficData(null);
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-8">
              <div className="px-4 py-1.5 bg-white/60 backdrop-blur-sm rounded-lg border border-white/40 shadow-sm">
                <span className="text-emerald-700 font-bold">Last 30 Days</span>
              </div>
              {dailyTrafficData && (
                <div className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-200">
                  <span className="text-2xl font-black">
                    {dailyTrafficData.total}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider opacity-90">
                    Period
                    <br />
                    Views
                  </span>
                </div>
              )}
            </div>

            <div className="h-[235px] relative">
              {loadingDailyTraffic ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600 mb-4"></div>
                  <p className="text-emerald-600 font-medium animate-pulse">
                    Generating Bar Chart...
                  </p>
                </div>
              ) : dailyTrafficData ? (
                <canvas id="dailyViewsBarChart"></canvas>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 italic">
                  No daily data available for this link
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Peak Daily Views
                </p>
                <p className="text-2xl font-bold text-gray-800">{peakViews}</p>
              </div>
              <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Consistency
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {consistency}%
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyViewsModal;
