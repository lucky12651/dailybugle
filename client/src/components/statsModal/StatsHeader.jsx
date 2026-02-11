import React from "react";
import { MousePointer2, Calendar } from "lucide-react";

const StatsHeader = ({ statsData }) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-center gap-2 text-zinc-500 mb-2">
          <MousePointer2 size={16} />
          <p className="text-xs font-bold uppercase tracking-wider">Total Clicks</p>
        </div>
        <p className="text-3xl font-bold text-white">
          {statsData.clicks.toLocaleString()}
        </p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-center gap-2 text-zinc-500 mb-2">
          <Calendar size={16} />
          <p className="text-xs font-bold uppercase tracking-wider">Created</p>
        </div>
        <p className="text-sm font-medium text-white leading-tight">
          {statsData.createdAt
            ? new Date(statsData.createdAt).toLocaleString(
                "en-IN",
                {
                  dateStyle: 'medium',
                  timeStyle: 'short',
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