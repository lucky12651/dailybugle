const getAuthHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: token ? `Bearer ${token}` : "",
});

const handleResponse = async (response) => {
  if (response.status === 401 || response.status === 400) {
    const data = await response.json();
    if (
      data.error === "Invalid token." ||
      data.error === "Token expired." ||
      data.error === "Access denied. No token provided."
    ) {
      return { success: false, authError: true, error: data.error };
    }
  }

  if (response.ok) {
    const data = await response.json();
    return { success: true, data };
  }

  try {
    const errorData = await response.json();
    return { success: false, error: errorData.error || "Request failed" };
  } catch (e) {
    return { success: false, error: "Request failed" };
  }
};

// API Helper Functions
export const fetchRecentLinks = async (limit = 25, offset = 0, token) => {
  try {
    const response = await fetch(
      `/api/recent?limit=${limit}&offset=${offset}`,
      {
        headers: getAuthHeaders(token),
      },
    );
    const result = await handleResponse(response);
    if (result.success) return result.data;
    if (result.authError) {
      // Potentially trigger global logout if we had a way to do it here
      console.warn("Auth error in fetchRecentLinks:", result.error);
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

    return await handleResponse(response);
  } catch (err) {
    return { success: false, error: "Network error occurred" };
  }
};

export const fetchLinkStats = async (slug, token) => {
  try {
    const response = await fetch(`/api/stats/${slug}`, {
      headers: getAuthHeaders(token),
    });
    return await handleResponse(response);
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
    return await handleResponse(response);
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
  period = null,
) => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append("limit", limit);
    params.append("offset", offset);
    if (period) {
      params.append("period", period);
    }

    const response = await fetch(
      `/api/stats/${slug}/clicks?${params.toString()}`,
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

export const fetchUserDailyTraffic = async (
  slug,
  userId,
  token,
  period = "30d",
) => {
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
    return await handleResponse(response);
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
    return await handleResponse(response);
  } catch (err) {
    return { success: false, error: "Network error" };
  }
};

export const fetchGlobalTraffic = async (period = "7d", token) => {
  try {
    const response = await fetch(`/api/stats/global/traffic?period=${period}`, {
      headers: getAuthHeaders(token),
    });
    return await handleResponse(response);
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
    return await handleResponse(response);
  } catch (err) {
    return { success: false, error: "Network error" };
  }
};

// Fetch link analytics data for individual links
export const fetchLinkLocationData = async (
  slug,
  userId,
  token,
  period = "7d",
) => {
  try {
    const response = await fetch(
      `/api/stats/${slug}/country?period=${period}`,
      {
        headers: getAuthHeaders(token),
      },
    );
    return await handleResponse(response);
  } catch (err) {
    return {
      success: false,
      error: "Network error occurred while fetching location data",
    };
  }
};

export const fetchLinkReferrerData = async (
  slug,
  userId,
  token,
  period = "7d",
) => {
  try {
    const response = await fetch(
      `/api/stats/${slug}/referrer?period=${period}`,
      {
        headers: getAuthHeaders(token),
      },
    );
    return await handleResponse(response);
  } catch (err) {
    return {
      success: false,
      error: "Network error occurred while fetching referrer data",
    };
  }
};

export const fetchLinkOSData = async (slug, userId, token, period = "7d") => {
  try {
    const response = await fetch(`/api/stats/${slug}/os?period=${period}`, {
      headers: getAuthHeaders(token),
    });
    return await handleResponse(response);
  } catch (err) {
    return {
      success: false,
      error: "Network error occurred while fetching OS data",
    };
  }
};

export const fetchLinkBotData = async (slug, userId, token, period = "7d") => {
  try {
    const response = await fetch(`/api/stats/${slug}/bots?period=${period}`, {
      headers: getAuthHeaders(token),
    });
    return await handleResponse(response);
  } catch (err) {
    return {
      success: false,
      error: "Network error occurred while fetching bot data",
    };
  }
};

export const fetchChartDataWithPeriod = async (slug, period = "7d", token) => {
  try {
    const headers = getAuthHeaders(token);

    // Fetch OS distribution with period
    const osResponse = await fetch(`/api/stats/${slug}/os?period=${period}`, {
      headers,
    });
    const osData = await osResponse.json();

    // Fetch device distribution (no period support)
    const deviceResponse = await fetch(`/api/stats/${slug}/device`, {
      headers,
    });
    const deviceData = await deviceResponse.json();

    // Combine OS and device data
    const combinedOsData = {
      labels: osData.labels,
      data: osData.data,
    };

    // Fetch country distribution with period
    const countryResponse = await fetch(
      `/api/stats/${slug}/country?period=${period}`,
      { headers },
    );
    const countryData = await countryResponse.json();

    // Fetch referrer distribution with period
    const referrerResponse = await fetch(
      `/api/stats/${slug}/referrer?period=${period}`,
      { headers },
    );
    const referrerData = await referrerResponse.json();

    // Fetch bot analytics with period
    const botResponse = await fetch(
      `/api/stats/${slug}/bots?period=${period}`,
      { headers },
    );
    const botData = await botResponse.json();

    // Fetch user analytics (no period support)
    const userResponse = await fetch(`/api/stats/${slug}/users`, {
      headers,
    });
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
    console.error("Error fetching chart stats with period:", err);
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
