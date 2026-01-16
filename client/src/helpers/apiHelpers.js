// API Helper Functions
export const fetchRecentLinks = async () => {
  try {
    const response = await fetch("/api/recent");
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

export const shortenUrl = async (longUrl, customSlug) => {
  try {
    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

export const fetchLinkStats = async (slug) => {
  try {
    const response = await fetch(`/api/stats/${slug}`);
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

export const fetchChartLinkStats = async (slug) => {
  try {
    // Fetch OS distribution
    const osResponse = await fetch(`/api/stats/${slug}/os`);
    const osData = await osResponse.json();

    // Fetch device distribution
    const deviceResponse = await fetch(`/api/stats/${slug}/device`);
    const deviceData = await deviceResponse.json();

    // Combine OS and device data
    const combinedOsData = {
      labels: osData.labels,
      data: osData.data,
    };

    // Fetch country distribution
    const countryResponse = await fetch(`/api/stats/${slug}/country`);
    const countryData = await countryResponse.json();

    // Fetch referrer distribution
    const referrerResponse = await fetch(`/api/stats/${slug}/referrer`);
    const referrerData = await referrerResponse.json();

    // Fetch bot analytics
    const botResponse = await fetch(`/api/stats/${slug}/bots`);
    const botData = await botResponse.json();

    return {
      osChartData: osResponse.ok ? combinedOsData : null,
      deviceChartData: deviceResponse.ok ? deviceData : null,
      countryChartData: countryResponse.ok ? countryData : null,
      referrerChartData: referrerResponse.ok ? referrerData : null,
      botChartData: botResponse.ok ? botData : null,
    };
  } catch (err) {
    console.error("Error fetching chart stats:", err);
    return {
      osChartData: null,
      deviceChartData: null,
      countryChartData: null,
      referrerChartData: null,
      botChartData: null,
    };
  }
};

export const fetchTrafficStats = async (slug, period = "7d") => {
  try {
    const response = await fetch(`/api/stats/${slug}/traffic?period=${period}`);
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
