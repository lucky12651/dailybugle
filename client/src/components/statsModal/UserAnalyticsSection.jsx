import React from "react";

const UserAnalyticsSection = ({ userChartData, showUserTraffic }) => {
  if (!userChartData || !userChartData.userDetails) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      {/* Top Users Chart */}
      <div className="bg-gradient-to-br from-teal-50 to-green-50 p-5 rounded-xl border border-teal-100 shadow-sm h-full min-h-[400px]">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          Top Users
        </h4>
        <div className="flex justify-center h-[300px] items-center">
          <canvas
            id="userChart"
            width="250"
            height="250"
          ></canvas>
        </div>
      </div>

      {/* User Details List */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-full min-h-[400px] flex flex-col">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          User Details
        </h4>
        <div className="overflow-y-auto flex-1 pr-2 max-h-[320px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userChartData.userDetails.map((user, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {user.userId}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {user.views}
                  </td>
                  <td className="px-1 py-3 whitespace-nowrap text-sm text-gray-600">
                    {user.lastFetched
                      ? new Date(
                          user.lastFetched,
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        }) +
                        ", " +
                        new Date(
                          user.lastFetched,
                        ).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">
                    <button
                      onClick={() =>
                        showUserTraffic(user.userId)
                      }
                      className="text-blue-600 hover:text-blue-800  font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#0000F5"
                      >
                        <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                      </svg>
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