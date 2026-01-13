import React from "react";

const Tabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex bg-gray-100 rounded-full p-1">
        <button
          onClick={() => setActiveTab("link")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 ${
            activeTab === "link"
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          Short Link
        </button>
        <button
          onClick={() => setActiveTab("qr")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors duration-200 ${
            activeTab === "qr"
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          QR Code
        </button>
      </div>
    </div>
  );
};

export default Tabs;
