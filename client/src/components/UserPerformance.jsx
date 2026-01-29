import React, { useState, useEffect } from "react";
import {
  fetchAllUsers,
  fetchGlobalUserTraffic,
  fetchUserLinks,
  fetchUserDailyTraffic,
} from "../helpers/apiHelpers";
import TrafficChartSection from "./UserPerformanceParts/TrafficChartSection";
import LinksTable from "./UserPerformanceParts/LinksTable";
import LinkInfoModal from "./UserPerformanceParts/LinkInfoModal";
import DailyViewsModal from "./UserPerformanceParts/DailyViewsModal";

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

  // Selected Link Stats State (Line Chart Modal)
  const [selectedLink, setSelectedLink] = useState(null);
  const [linkTrafficPeriod, setLinkTrafficPeriod] = useState("7d");
  const [linkTrafficData, setLinkTrafficData] = useState(null);
  const [loadingLinkTraffic, setLoadingLinkTraffic] = useState(false);

  // Selected Link Daily Bar Chart State (Bar Chart Modal)
  const [dailyLink, setDailyLink] = useState(null);
  const [dailyTrafficData, setDailyTrafficData] = useState(null);
  const [loadingDailyTraffic, setLoadingDailyTraffic] = useState(false);

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
      setSelectedLink(null);
      setLinkTrafficData(null);
      setDailyLink(null);
      setDailyTrafficData(null);
      loadLinks(0, true);
    }
  }, [selectedUser, token]);

  useEffect(() => {
    if (selectedLink) {
      loadLinkTrafficData();
    }
  }, [selectedLink, linkTrafficPeriod, token]);

  useEffect(() => {
    if (dailyLink) {
      loadDailyTrafficData();
    }
  }, [dailyLink, token]);

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
    const result = await fetchGlobalUserTraffic(
      selectedUser,
      trafficPeriod,
      token,
    );
    if (result.success) {
      setTrafficData(result.data);
    }
    setLoadingTraffic(false);
  };

  const loadLinkTrafficData = async () => {
    setLoadingLinkTraffic(true);
    const result = await fetchUserDailyTraffic(
      selectedLink.slug,
      selectedUser,
      token,
      linkTrafficPeriod,
    );
    if (result.success) {
      setLinkTrafficData(result.data);
    }
    setLoadingLinkTraffic(false);
  };

  const loadDailyTrafficData = async () => {
    setLoadingDailyTraffic(true);
    // Use 30d for bar chart by default as it's the standard for bar view
    const result = await fetchUserDailyTraffic(
      dailyLink.slug,
      selectedUser,
      token,
      "30d",
    );
    if (result.success) {
      setDailyTrafficData(result.data);
    }
    setLoadingDailyTraffic(false);
  };

  const loadLinks = async (offset = 0, isInitial = false) => {
    if (isInitial) setLoadingLinks(true);
    else setLoadingMoreLinks(true);

    const result = await fetchUserLinks(
      selectedUser,
      LINKS_PER_PAGE,
      offset,
      token,
    );

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
    return null;
  }

  return (
    <>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-8 mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          User Performance
        </h2>

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
            <TrafficChartSection
              trafficPeriod={trafficPeriod}
              setTrafficPeriod={setTrafficPeriod}
              trafficData={trafficData}
              loadingTraffic={loadingTraffic}
            />

            <LinksTable
              userLinks={userLinks}
              loadingLinks={loadingLinks}
              selectedLink={selectedLink}
              setSelectedLink={setSelectedLink}
              dailyLink={dailyLink}
              setDailyLink={setDailyLink}
              hasMoreLinks={hasMoreLinks}
              handleLoadMoreLinks={handleLoadMoreLinks}
              loadingMoreLinks={loadingMoreLinks}
            />
          </div>
        )}
      </div>

      {selectedUser && (
        <>
          <LinkInfoModal
            selectedLink={selectedLink}
            setSelectedLink={setSelectedLink}
            selectedUser={selectedUser}
            linkTrafficPeriod={linkTrafficPeriod}
            setLinkTrafficPeriod={setLinkTrafficPeriod}
            linkTrafficData={linkTrafficData}
            loadingLinkTraffic={loadingLinkTraffic}
            setLinkTrafficData={setLinkTrafficData}
          />

          <DailyViewsModal
            dailyLink={dailyLink}
            setDailyLink={setDailyLink}
            selectedUser={selectedUser}
            dailyTrafficData={dailyTrafficData}
            loadingDailyTraffic={loadingDailyTraffic}
            setDailyTrafficData={setDailyTrafficData}
          />
        </>
      )}
    </>
  );
};

export default UserPerformance;
