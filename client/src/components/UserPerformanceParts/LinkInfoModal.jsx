import React, { useEffect } from "react";
import { renderTrafficChart } from "../../helpers/chartHelpers";

const LinkInfoModal = ({
  selectedLink,
  setSelectedLink,
  selectedUser,
  linkTrafficPeriod,
  setLinkTrafficPeriod,
  linkTrafficData,
  loadingLinkTraffic,
  setLinkTrafficData
}) => {
  useEffect(() => {
    if (linkTrafficData && selectedLink) {
      renderTrafficChart("linkPerformanceChart", linkTrafficData);
    }
  }, [linkTrafficData, selectedLink]);

  if (!selectedLink) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div>
            <h4 className="text-xl font-bold text-gray-800">
              Traffic Analysis: /{selectedLink.slug}
            </h4>
            <p className="text-sm text-gray-500">
              Viewing engagement for{" "}
              <span className="font-semibold text-blue-600">
                {selectedUser}
              </span>
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedLink(null);
              setLinkTrafficData(null);
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
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div className="flex bg-white/60 backdrop-blur-sm p-1 rounded-xl border border-white/40 shadow-sm w-fit">
                {["24h", "3d", "7d", "30d"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setLinkTrafficPeriod(period)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      linkTrafficPeriod === period
                        ? "bg-white text-blue-600 shadow-sm scale-105"
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/40"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {linkTrafficData && (
                <div className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-200">
                  <span className="text-2xl font-black">
                    {linkTrafficData.total}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider opacity-90">
                    Total
                    <br />
                    Views
                  </span>
                </div>
              )}
            </div>

            <div className="h-[235px] relative">
              {loadingLinkTraffic ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600 mb-4"></div>
                  <p className="text-blue-600 font-medium animate-pulse">
                    Loading Analytics...
                  </p>
                </div>
              ) : linkTrafficData ? (
                <canvas id="linkPerformanceChart"></canvas>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 italic">
                  No traffic data available for this link
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkInfoModal;
