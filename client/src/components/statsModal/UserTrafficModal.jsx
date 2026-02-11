import React, { useEffect } from "react";
import { renderDailyViewsBarChart } from "../../helpers/chartHelpers";
import Loader from "../Loader";
import { X, User, BarChart2 } from "lucide-react";

const UserTrafficModal = ({
  selectedUser,
  closeUserTraffic,
  loadingUserTraffic,
  userTrafficData,
}) => {
  useEffect(() => {
    if (userTrafficData && selectedUser) {
      renderDailyViewsBarChart("userDailyViewsChart", userTrafficData);
    }
  }, [userTrafficData, selectedUser]);

  if (!selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 rounded-lg">
              <User className="text-blue-500" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                User Traffic Analysis
              </h4>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">ID: {selectedUser}</p>
            </div>
          </div>
          <button
            onClick={closeUserTraffic}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-8">
          <div className="h-72">
            {loadingUserTraffic ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader />
                <p className="text-sm text-zinc-500 animate-pulse">Fetching user activity...</p>
              </div>
            ) : userTrafficData ? (
              <>
                <div className="mb-8 flex items-baseline gap-2 justify-center">
                  <span className="text-4xl font-black text-white">
                    {userTrafficData.total.toLocaleString()}
                  </span>
                  <span className="text-sm text-zinc-500 font-bold uppercase tracking-widest">
                    views (30D)
                  </span>
                </div>
                <div className="h-48 relative">
                  <canvas id="userDailyViewsChart"></canvas>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-600 border-2 border-dashed border-zinc-900 rounded-2xl">
                <BarChart2 size={32} strokeWidth={1} />
                <p className="text-sm font-medium">No activity data for this user</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTrafficModal;
