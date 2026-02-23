import React from "react";
import { Settings, LogOut, Bug } from "lucide-react";

const Header = ({ onSettingsClick, onLogoutClick, showSettings }) => {
  return (
    <header className="bg-transparent border-b border-zinc-900 sticky top-0 backdrop-blur-md z-50">
      <div className="max-w-6xl mx-auto py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            DailyBugle
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSettingsClick}
            className={`p-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
              showSettings
                ? "bg-green-600 border-green-500 text-black"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Settings size={18} />
          </button>

          <button
            onClick={onLogoutClick}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-xl border border-zinc-800 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
