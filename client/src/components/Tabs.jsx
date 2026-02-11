import React from "react";
import { Link2, QrCode } from "lucide-react";

const Tabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex bg-zinc-900 rounded-full p-1 border border-zinc-800">
        <button
          onClick={() => setActiveTab("link")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-200 text-sm font-bold ${
            activeTab === "link"
              ? "bg-green-600 text-black shadow-lg shadow-green-600/20"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          <Link2 size={18} />
          Short Link
        </button>
        <button
          onClick={() => setActiveTab("qr")}
          className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-200 text-sm font-bold ${
            activeTab === "qr"
              ? "bg-green-600 text-black shadow-lg shadow-green-600/20"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          <QrCode size={18} />
          QR Code
        </button>
      </div>
    </div>
  );
};

export default Tabs;
