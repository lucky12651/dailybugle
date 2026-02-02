import React from "react";
import Loader from "../Loader";

const UserTrafficModal = ({
  selectedUser,
  closeUserTraffic,
  loadingUserTraffic,
  userTrafficData,
}) => {
  if (!selectedUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] ">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden h-[400px]">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 border-b border-indigo-100 flex justify-between items-center">
          <h4 className="text-lg font-semibold text-gray-800">
            User Traffic:{" "}
            <span className="text-blue-600">{selectedUser}</span>
          </h4>
          <button
            onClick={closeUserTraffic}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <div className="h-64">
            {loadingUserTraffic ? (
              <div className="flex items-center justify-center h-full">
                <Loader />
              </div>
            ) : userTrafficData ? (
              <>
                <div className="mb-2 text-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {userTrafficData.total}
                  </span>
                  <span className="text-gray-600 ml-2">
                    views (last 30 days)
                  </span>
                </div>
                <canvas
                  id="userDailyViewsChart"
                  width="400"
                  height="200"
                ></canvas>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No traffic data available for this user
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTrafficModal;