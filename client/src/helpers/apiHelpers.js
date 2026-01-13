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

    // Fetch country distribution
    const countryResponse = await fetch(`/api/stats/${slug}/country`);
    const countryData = await countryResponse.json();

    return {
      osChartData: osResponse.ok ? osData : null,
      countryChartData: countryResponse.ok ? countryData : null,
    };
  } catch (err) {
    console.error("Error fetching chart stats:", err);
    return { osChartData: null, countryChartData: null };
  }
};
