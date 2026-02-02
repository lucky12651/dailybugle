import React from "react";

const StatsHeader = ({ statsData }) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-blue-50 p-4 rounded-xl">
        <p className="text-sm text-blue-700">Total Clicks</p>
        <p className="text-3xl font-bold text-blue-800">
          {statsData.clicks}
        </p>
      </div>
      <div className="bg-blue-50 p-4 rounded-xl">
        <p className="text-sm text-blue-700">Created</p>
        <p className="text-sm text-blue-800">
          {statsData.createdAt
            ? new Date(statsData.createdAt).toLocaleString(
                "en-IN",
                {
                  timeZone: "Asia/Kolkata",
                },
              )
            : "N/A"}
        </p>
      </div>
    </div>
  );
};

export default StatsHeader;