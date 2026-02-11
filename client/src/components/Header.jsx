import React from "react";
import { Settings, LogOut, Bug } from "lucide-react";

const Header = ({ onSettingsClick, onLogoutClick, showSettings }) => {
  return (
    <header className="bg-transparent border-b border-zinc-900 sticky top-0 backdrop-blur-md z-50">
      <div className="max-w-6xl mx-auto py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/20">
            <Bug className="text-green-500" size={24} />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            DailyBugle
            <span className="text-[8px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-700 uppercase tracking-widest font-bold">
              v1.3.4.1
            </span>
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
            <span className="hidden sm:inline">{showSettings ? "Dashboard" : "Settings"}</span>
          </button>
          
          <button
            onClick={onLogoutClick}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-xl border border-zinc-800 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
