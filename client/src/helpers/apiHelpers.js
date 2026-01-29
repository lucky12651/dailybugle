const getAuthHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

// API Helper Functions
export const fetchRecentLinks = async (limit = 25, offset = 0, token) => {
  try {
    const response = await fetch(
      `/api/recent?limit=${limit}&offset=${offset}`,
      {
        headers: getAuthHeaders(token),
      },
    );
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return [];
  } catch (err) {
    console.error("Error fetching recent links:", err);
    return [];
  }
};

export const shortenUrl = async (longUrl, customSlug, token) => {
  try {
    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        longUrl,
        customSlug: customSlug.trim() || undefined,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error || "An error occurred" };
    }
  } catch (err) {
    return { success: false, error: "Network error occurred" };
  }
};

export const fetchLinkStats = async (slug, token) => {
  try {
    const response = await fetch(`/api/stats/${slug}`, {
      headers: getAuthHeaders(token),
    });
    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error || "Failed to fetch stats" };
    }
  } catch (err) {
    return {
      success: false,
      error: "Network error occurred while fetching stats",
    };
  }
};

export const fetchChartLinkStats = async (slug, token) => {
  try {
    const headers = getAuthHeaders(token);
    // Fetch OS distribution
    const osResponse = await fetch(`/api/stats/${slug}/os`, { headers });
    const osData = await osResponse.json();

    // Fetch device distribution
    const deviceResponse = await fetch(`/api/stats/${slug}/device`, {
      headers,
    });
    const deviceData = await deviceResponse.json();

    // Combine OS and device data
    const combinedOsData = {
      labels: osData.labels,
      data: osData.data,
    };

    // Fetch country distribution
    const countryResponse = await fetch(`/api/stats/${slug}/country`, {
      headers,
    });
    const countryData = await countryResponse.json();

    // Fetch referrer distribution
    const referrerResponse = await fetch(`/api/stats/${slug}/referrer`, {
      headers,
    });
    const referrerData = await referrerResponse.json();

    // Fetch bot analytics
    const botResponse = await fetch(`/api/stats/${slug}/bots`, { headers });
    const botData = await botResponse.json();

    // Fetch user analytics
    const userResponse = await fetch(`/api/stats/${slug}/users`, { headers });
    const userData = await userResponse.json();

    return {
      osChartData: osResponse.ok ? combinedOsData : null,
      deviceChartData: deviceResponse.ok ? deviceData : null,
      countryChartData: countryResponse.ok ? countryData : null,
      referrerChartData: referrerResponse.ok ? referrerData : null,
      botChartData: botResponse.ok ? botData : null,
      userChartData: userResponse.ok ? userData : null,
    };
  } catch (err) {
    console.error("Error fetching chart stats:", err);
    return {
      osChartData: null,
      deviceChartData: null,
      countryChartData: null,
      referrerChartData: null,
      botChartData: null,
      userChartData: null,
    };
  }
};

export const fetchTrafficStats = async (slug, period = "7d", token) => {
  try {
    const response = await fetch(
      `/api/stats/${slug}/traffic?period=${period}`,
      {
        headers: getAuthHeaders(token),
      },
    );
    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return {
        success: false,
        error: data.error || "Failed to fetch traffic stats",
      };
    }
  } catch (err) {
    return {
      success: false,
      error: "Network error occurred while fetching traffic stats",
    };
  }
};

export const fetchClickDetails = async (
  slug,
  limit = 25,
  offset = 0,
  token,
) => {
  try {
    const response = await fetch(
      `/api/stats/${slug}/clicks?limit=${limit}&offset=${offset}`,
      {
        headers: getAuthHeaders(token),
      },
    );
    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return {
        success: false,
        error: data.error || "Failed to fetch click details",
      };
    }
  } catch (err) {
    return {
      success: false,
      error: "Network error occurred while fetching click details",
    };
  }
};

export const fetchUserDailyTraffic = async (slug, userId, token, period = "30d") => {
  try {
    const response = await fetch(
      `/api/stats/${slug}/users/${userId}/traffic?period=${period}`,
      {
        headers: getAuthHeaders(token),
      },
    );
    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return {
        success: false,
        error: data.error || "Failed to fetch user traffic stats",
      };
    }
  } catch (err) {
    return {
      success: false,
      error: "Network error occurred while fetching user traffic stats",
    };
  }
};

export const fetchAllUsers = async (token) => {
  try {
    const response = await fetch("/api/users", {
      headers: getAuthHeaders(token),
    });
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    }
    return { success: false, error: "Failed to fetch users" };
  } catch (err) {
    return { success: false, error: "Network error" };
  }
};

export const fetchGlobalUserTraffic = async (userId, period = "7d", token) => {
  try {
    const response = await fetch(
      `/api/users/${userId}/traffic?period=${period}`,
      { headers: getAuthHeaders(token) },
    );
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    }
    return { success: false, error: "Failed to fetch traffic" };
  } catch (err) {
    return { success: false, error: "Network error" };
  }
};

export const fetchUserLinks = async (userId, limit = 15, offset = 0, token) => {
  try {
    const response = await fetch(
      `/api/users/${userId}/links?limit=${limit}&offset=${offset}`,
      { headers: getAuthHeaders(token) },
    );
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    }
    return { success: false, error: "Failed to fetch links" };
  } catch (err) {
    return { success: false, error: "Network error" };
  }
};
