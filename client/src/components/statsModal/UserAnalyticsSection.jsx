import React from "react";
import { Users, Info, ArrowRight, Eye, Calendar } from "lucide-react";

const UserAnalyticsSection = ({ userChartData, showUserTraffic }) => {
  if (!userChartData || !userChartData.userDetails) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      {/* Top Users Chart */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col min-h-[400px]">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-green-600/10 rounded-lg">
            <Users className="text-green-500" size={20} />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Top Users
          </h4>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[250px] aspect-square">
            <canvas id="userChart"></canvas>
          </div>
        </div>
      </div>

      {/* User Details List */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col min-h-[400px]">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-blue-600/10 rounded-lg">
            <Info className="text-blue-500" size={20} />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            User Details
          </h4>
        </div>
        <div className="overflow-y-auto flex-1 custom-scrollbar -mr-2 pr-2">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-zinc-900 z-10">
              <tr className="border-b border-zinc-800">
                <th className="pb-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  User ID
                </th>
                <th className="pb-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">
                  Views
                </th>
                <th className="pb-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {userChartData.userDetails.map((user, idx) => (
                <tr key={idx} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-mono text-zinc-300 group-hover:text-white transition-colors">
                        {user.userId}
                      </span>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} />
                        {user.lastFetched
                          ? new Date(user.lastFetched).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-zinc-300">
                      <Eye size={12} className="text-zinc-500" />
                      <span className="text-sm font-bold">{user.views}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => showUserTraffic(user.userId)}
                      className="p-2 bg-zinc-800 hover:bg-green-600 text-zinc-400 hover:text-black rounded-lg transition-all"
                      title="View Details"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserAnalyticsSection;