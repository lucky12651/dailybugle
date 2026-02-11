import React from "react";
import {
  Clock,
  Smartphone,
  Monitor,
  Globe,
  User,
  Shield,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ListFilter,
} from "lucide-react";

const ClickDetailsSection = ({
  clickDetails,
  hasMoreClicks,
  loadingMoreClicks,
  loadMoreClicks,
}) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-600/10 rounded-lg">
            <ListFilter className="text-orange-500" size={20} />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Click Log
          </h4>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Human
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Bot
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-6 px-6 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="pb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-2">
                Time (IST)
              </th>
              <th className="pb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Platform
              </th>
              <th className="pb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Location
              </th>
              <th className="pb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right pr-2">
                Identity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {clickDetails && clickDetails.length > 0 ? (
              clickDetails.map((click, idx) => (
                <tr
                  key={idx}
                  className={`group transition-colors hover:bg-white/5 ${
                    click.isBot ? "bg-red-500/5" : "bg-green-500/[0.02]"
                  }`}
                >
                  <td className="py-4 pl-2">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Clock size={12} className="text-zinc-500" />
                      <span className="text-sm font-mono leading-none">
                        {click.timestamp
                          ? new Date(click.timestamp).toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              day: "2-digit",
                              month: "short",
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {click.deviceInfo?.deviceType === "mobile" ? (
                          <Smartphone size={14} className="text-zinc-500" />
                        ) : (
                          <Monitor size={14} className="text-zinc-500" />
                        )}
                        <span className="text-sm text-zinc-300 font-medium leading-none">
                          {click.deviceInfo?.browser || "Unknown"}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono pl-5 uppercase">
                        {click.deviceInfo?.os || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Globe size={14} className="text-zinc-500" />
                      <span className="text-sm">
                        {click.location || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 pr-2 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                        {click.isBot ? (
                          <Shield size={14} className="text-red-500" />
                        ) : (
                          <UserCheck size={14} className="text-green-500" />
                        )}
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            click.isBot ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {click.isBot ? "Bot" : "Human"}
                        </span>
                      </div>
                      {click.userId && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          ID: {click.userId}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-zinc-600">
                    <ListFilter size={32} strokeWidth={1} />
                    <p className="text-sm font-medium">
                      No click data recorded yet
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMoreClicks && (
        <div className="mt-8 flex justify-center border-t border-zinc-800 pt-6">
          <button
            onClick={() => loadMoreClicks()}
            disabled={loadingMoreClicks}
            className="flex items-center gap-2 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all border border-zinc-700"
          >
            {loadingMoreClicks ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <ChevronRight size={16} />
            )}
            {loadingMoreClicks ? "Loading..." : "Load More Activity"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ClickDetailsSection;
