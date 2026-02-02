import React from "react";

const DistributionChartsSection = ({
  osChartData,
  deviceChartData,
  countryChartData,
  referrerChartData,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {osChartData && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
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

        {deviceChartData && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              Device Distribution
            </h4>
            <div className="flex justify-center">
              <canvas
                id="deviceChart"
                width="200"
                height="200"
              ></canvas>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {countryChartData && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              Location Distribution
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

        {referrerChartData && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl border border-yellow-100 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              Referrer Distribution
            </h4>
            <div className="flex justify-center">
              <canvas
                id="referrerChart"
                width="200"
                height="200"
              ></canvas>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributionChartsSection;