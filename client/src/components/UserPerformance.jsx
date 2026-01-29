import React, { useState, useEffect } from "react";
import {
  fetchAllUsers,
  fetchGlobalUserTraffic,
  fetchUserLinks,
} from "../helpers/apiHelpers";
import { renderTrafficChart } from "../helpers/chartHelpers";

const UserPerformance = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Traffic Stats State
  const [trafficPeriod, setTrafficPeriod] = useState("7d");
  const [trafficData, setTrafficData] = useState(null);
  const [loadingTraffic, setLoadingTraffic] = useState(false);

  // Links Table State
  const [userLinks, setUserLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [loadingMoreLinks, setLoadingMoreLinks] = useState(false);
  const [linksOffset, setLinksOffset] = useState(0);
  const [hasMoreLinks, setHasMoreLinks] = useState(true);
  const LINKS_PER_PAGE = 15;

  useEffect(() => {
    loadUsers();
  }, [token]);

  useEffect(() => {
    if (selectedUser) {
      loadTrafficData();
    }
  }, [selectedUser, trafficPeriod, token]);

  useEffect(() => {
    if (selectedUser) {
      // Reset links when user changes
      setUserLinks([]);
      setLinksOffset(0);
      setHasMoreLinks(true);
      loadLinks(0, true);
    }
  }, [selectedUser, token]);

  useEffect(() => {
    if (trafficData) {
      renderTrafficChart("userPerformanceChart", trafficData);
    }
  }, [trafficData]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    const result = await fetchAllUsers(token);
    if (result.success) {
      setUsers(result.data);
      if (result.data.length > 0) {
        setSelectedUser(result.data[0]);
      }
    }
    setLoadingUsers(false);
  };

  const loadTrafficData = async () => {
    setLoadingTraffic(true);
    const result = await fetchGlobalUserTraffic(selectedUser, trafficPeriod, token);
    if (result.success) {
      setTrafficData(result.data);
    }
    setLoadingTraffic(false);
  };

  const loadLinks = async (offset = 0, isInitial = false) => {
    if (isInitial) setLoadingLinks(true);
    else setLoadingMoreLinks(true);

    const result = await fetchUserLinks(selectedUser, LINKS_PER_PAGE, offset, token);
    
    if (result.success) {
      const newLinks = result.data;
      if (isInitial) {
        setUserLinks(newLinks);
      } else {
        setUserLinks((prev) => [...prev, ...newLinks]);
      }
      
      if (newLinks.length < LINKS_PER_PAGE) {
        setHasMoreLinks(false);
      } else {
        setHasMoreLinks(true);
      }
      setLinksOffset(offset + newLinks.length);
    }
    
    if (isInitial) setLoadingLinks(false);
    else setLoadingMoreLinks(false);
  };

  const handleLoadMoreLinks = () => {
    if (!loadingMoreLinks && hasMoreLinks) {
      loadLinks(linksOffset);
    }
  };

  if (loadingUsers && users.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 mt-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return null; // Or show a message "No users found"
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-8 mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">User Performance</h2>

      {/* User Tabs */}
      <div className="flex overflow-x-auto space-x-2 mb-8 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {users.map((user) => (
          <button
            key={user}
            onClick={() => setSelectedUser(user)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedUser === user
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {user}
          </button>
        ))}
      </div>

      {selectedUser && (
        <div className="space-y-8">
          {/* Traffic Chart Section */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-5 rounded-xl border border-cyan-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                Traffic Over Time
              </h4>
              <div className="flex mt-2 sm:mt-0 space-x-2">
                {["24h", "3d", "7d", "30d"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTrafficPeriod(period)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      {
                        "24h": "bg-blue-100 text-blue-800 hover:bg-blue-200",
                        "3d": "bg-green-100 text-green-800 hover:bg-green-200",
                        "7d": "bg-purple-100 text-purple-800 hover:bg-purple-200",
                        "30d": "bg-orange-100 text-orange-800 hover:bg-orange-200",
                      }[period] || "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    } ${
                      trafficPeriod === period
                        ? "ring-2 ring-offset-2 ring-current"
                        : ""
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-64">
              {loadingTraffic ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : trafficData ? (
                <>
                  <div className="mb-2 text-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {trafficData.total}
                    </span>
                    <span className="text-gray-600 ml-2">
                      total views
                    </span>
                  </div>
                  <canvas
                    id="userPerformanceChart"
                    width="400"
                    height="200"
                  ></canvas>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No traffic data available
                </div>
              )}
            </div>
          </div>

          {/* Links Table Section */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-lg font-semibold text-gray-800">
                Accessed Links
              </h4>
            </div>
            
            {loadingLinks && userLinks.length === 0 ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : userLinks.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Link
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Accessed
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userLinks.map((link, index) => (
                        <tr key={`${link.slug}-${index}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            /{link.slug}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {link.views}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {link.lastAccessed
                              ? new Date(link.lastAccessed).toLocaleString("en-IN", {
                                  timeZone: "Asia/Kolkata",
                                })
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {hasMoreLinks && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-center">
                    <button
                      onClick={handleLoadMoreLinks}
                      disabled={loadingMoreLinks}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm disabled:opacity-50"
                    >
                      {loadingMoreLinks ? "Loading..." : "Show More"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No links found for this user
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPerformance;
