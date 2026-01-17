const db = require("../oracleNosql");
const crypto = require("crypto");

class ClickModel {
  static async create(clickData) {
    try {
      const {
        slug,
        ip,
        userAgent,
        referer,
        country,
        location,
        isBot,
        botCategory,
        botName,
        deviceInfo,
      } = clickData;

      const id = crypto.randomUUID();
      const timestamp = new Date().toISOString();

      await db.query(`
        INSERT INTO clicks VALUES (
          '${id}',
          '${slug}',
          '${timestamp}',
          '${ip || ""}',
          '${userAgent || ""}',
          '${referer || ""}',
          '${country || ""}',
          '${location || ""}',
          ${!!isBot},
          '${botCategory || ""}',
          '${botName || ""}',
          ${JSON.stringify(deviceInfo || {})}
        )
      `);

      return {
        id,
        slug,
        timestamp,
        ip,
        userAgent,
        referer,
        country,
        location,
        isBot: !!isBot,
        botCategory,
        botName,
        deviceInfo,
      };
    } catch (error) {
      throw error;
    }
  }

  static async findBySlug(slug) {
    try {
      const result = await db.query(`
        SELECT * FROM clicks WHERE slug = '${slug}'
      `);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getStatsBySlug(slug) {
    try {
      const result = await db.query(`
        SELECT * FROM clicks WHERE slug = '${slug}'
      `);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getOsStats(slug) {
    try {
      const clicks = await this.findBySlug(slug);

      const osCount = {};
      clicks.forEach((click) => {
        if (click.deviceInfo && click.deviceInfo.os) {
          const os = click.deviceInfo.os;
          osCount[os] = (osCount[os] || 0) + 1;
        }
      });

      // Sort and format data for chart
      const sortedEntries = Object.entries(osCount).sort((a, b) => b[1] - a[1]);

      // Get top 7 OS and aggregate the rest as 'Others'
      let topEntries = sortedEntries.slice(0, 7);
      let othersCount = 0;

      if (sortedEntries.length > 7) {
        for (let i = 7; i < sortedEntries.length; i++) {
          othersCount += sortedEntries[i][1];
        }
        topEntries.push(["Others", othersCount]);
      }

      const labels = topEntries.map((entry) => entry[0]);
      const data = topEntries.map((entry) => entry[1]);

      return { labels, data };
    } catch (error) {
      throw error;
    }
  }

  static async getDeviceStats(slug) {
    try {
      const clicks = await this.findBySlug(slug);

      const deviceCount = {};
      clicks.forEach((click) => {
        if (click.deviceInfo && click.deviceInfo.deviceType) {
          const deviceType = click.deviceInfo.deviceType;
          deviceCount[deviceType] = (deviceCount[deviceType] || 0) + 1;
        }
      });

      // Sort and format data for chart
      const sortedEntries = Object.entries(deviceCount).sort(
        (a, b) => b[1] - a[1],
      );

      // Get top 7 device types and aggregate the rest as 'Others'
      let topEntries = sortedEntries.slice(0, 7);
      let othersCount = 0;

      if (sortedEntries.length > 7) {
        for (let i = 7; i < sortedEntries.length; i++) {
          othersCount += sortedEntries[i][1];
        }
        topEntries.push(["Others", othersCount]);
      }

      const labels = topEntries.map((entry) => entry[0]);
      const data = topEntries.map((entry) => entry[1]);

      return { labels, data };
    } catch (error) {
      throw error;
    }
  }

  static async getReferrerStats(slug) {
    try {
      const clicks = await this.findBySlug(slug);

      const referrerCount = {};
      clicks.forEach((click) => {
        const referrer = click.referer || "Direct Traffic";

        // Clean and categorize referrers
        let cleanReferrer = "Direct Traffic";
        if (referrer !== "Direct Traffic" && referrer) {
          try {
            const url = new URL(referrer);
            const hostname = url.hostname.replace("www.", "");

            // Categorize common referrers
            if (hostname.includes("google")) cleanReferrer = "Google";
            else if (hostname.includes("bing")) cleanReferrer = "Bing";
            else if (hostname.includes("yahoo")) cleanReferrer = "Yahoo";
            else if (hostname.includes("facebook")) cleanReferrer = "Facebook";
            else if (hostname.includes("twitter") || hostname.includes("x.com"))
              cleanReferrer = "Twitter/X";
            else if (hostname.includes("linkedin")) cleanReferrer = "LinkedIn";
            else if (hostname.includes("reddit")) cleanReferrer = "Reddit";
            else cleanReferrer = hostname;
          } catch (e) {
            cleanReferrer = "Invalid URL";
          }
        }

        referrerCount[cleanReferrer] = (referrerCount[cleanReferrer] || 0) + 1;
      });

      // Sort and format data for chart
      const sortedEntries = Object.entries(referrerCount).sort(
        (a, b) => b[1] - a[1],
      );

      // Get top 5 referrers and aggregate the rest as 'Others'
      let topEntries = sortedEntries.slice(0, 5);
      let othersCount = 0;

      if (sortedEntries.length > 5) {
        for (let i = 5; i < sortedEntries.length; i++) {
          othersCount += sortedEntries[i][1];
        }
        topEntries.push(["Others", othersCount]);
      }

      const labels = topEntries.map((entry) => entry[0]);
      const data = topEntries.map((entry) => entry[1]);

      return { labels, data };
    } catch (error) {
      throw error;
    }
  }

  static async getBotStats(slug) {
    try {
      const clicks = await this.findBySlug(slug);

      // Count bot vs human traffic
      const trafficTypeCount = {
        human: 0,
        bot: 0,
      };

      // Count bot categories
      const botCategoryCount = {};

      // Count specific bots
      const botNameCount = {};

      clicks.forEach((click) => {
        if (click.isBot) {
          trafficTypeCount.bot++;

          // Count by category
          const category = click.botCategory || "Unknown";
          botCategoryCount[category] = (botCategoryCount[category] || 0) + 1;

          // Count by specific bot name
          const botName = click.botName || "Unknown Bot";
          botNameCount[botName] = (botNameCount[botName] || 0) + 1;
        } else {
          trafficTypeCount.human++;
        }
      });

      // Prepare data for charts
      const trafficTypeData = {
        labels: ["Human Users", "Bots"],
        data: [trafficTypeCount.human, trafficTypeCount.bot],
      };

      // Bot category distribution
      const sortedCategories = Object.entries(botCategoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // Top 5 categories

      const categoryData = {
        labels: sortedCategories.map((entry) => entry[0]),
        data: sortedCategories.map((entry) => entry[1]),
      };

      // Specific bot distribution
      const sortedBots = Object.entries(botNameCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7); // Top 7 bots

      const botData = {
        labels: sortedBots.map((entry) => entry[0]),
        data: sortedBots.map((entry) => entry[1]),
      };

      return {
        trafficType: trafficTypeData,
        botCategories: categoryData,
        botNames: botData,
        totals: {
          human: trafficTypeCount.human,
          bot: trafficTypeCount.bot,
          total: trafficTypeCount.human + trafficTypeCount.bot,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async getTrafficStats(slug, period = "7d") {
    try {
      const clicks = await this.findBySlug(slug);

      // Process clicks based on period
      const now = new Date();
      let cutoffDate;

      switch (period) {
        case "24h":
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "3d":
          cutoffDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
          break;
        case "7d":
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Filter clicks by date and group by hour/day
      const clicksByTime = {};
      clicks.forEach((click) => {
        if (click.timestamp) {
          const clickTime = new Date(click.timestamp);
          if (clickTime >= cutoffDate) {
            let timeKey;

            if (period === "24h") {
              // Group by hour for 24h view
              timeKey = clickTime.toISOString().slice(0, 13) + ":00:00";
            } else {
              // Group by day for longer periods
              timeKey = clickTime.toISOString().slice(0, 10);
            }

            clicksByTime[timeKey] = (clicksByTime[timeKey] || 0) + 1;
          }
        }
      });

      // Create time series data
      const timeLabels = [];
      const clickCounts = [];

      if (period === "24h") {
        // Last 24 hours - hourly data
        for (let i = 23; i >= 0; i--) {
          const hourTime = new Date(now.getTime() - i * 60 * 60 * 1000);
          const hourKey = hourTime.toISOString().slice(0, 13) + ":00:00";
          timeLabels.push(
            hourTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          );
          clickCounts.push(clicksByTime[hourKey] || 0);
        }
      } else {
        // Daily data for longer periods
        const days = period === "3d" ? 3 : period === "7d" ? 7 : 30;
        for (let i = days - 1; i >= 0; i--) {
          const dayTime = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayKey = dayTime.toISOString().slice(0, 10);
          timeLabels.push(dayTime.toLocaleDateString());
          clickCounts.push(clicksByTime[dayKey] || 0);
        }
      }

      return {
        period,
        labels: timeLabels,
        data: clickCounts,
        total: clickCounts.reduce((sum, count) => sum + count, 0),
      };
    } catch (error) {
      throw error;
    }
  }

  static async getCountryStats(slug) {
    try {
      const clicks = await this.findBySlug(slug);

      // Count location distribution - prioritize city/country combination if available
      const locationCount = {};
      clicks.forEach((click) => {
        if (click.country) {
          // Convert country code to full name using a mapping
          const countryName = this.getCountryName(click.country);
          // Use the location field which includes city/region info if available
          const location = click.location || countryName;
          locationCount[location] = (locationCount[location] || 0) + 1;
        }
      });

      // Sort and format data for chart
      const sortedEntries = Object.entries(locationCount).sort(
        (a, b) => b[1] - a[1],
      );

      // Get top 3 locations and aggregate the rest as 'Others'
      let topEntries = sortedEntries.slice(0, 3);
      let othersCount = 0;

      if (sortedEntries.length > 3) {
        for (let i = 3; i < sortedEntries.length; i++) {
          othersCount += sortedEntries[i][1];
        }
        topEntries.push(["Others", othersCount]);
      }

      const labels = topEntries.map((entry) => entry[0]);
      const data = topEntries.map((entry) => entry[1]);

      return { labels, data };
    } catch (error) {
      throw error;
    }
  }

  static getCountryName(code) {
    const countryCodes = {
      AF: "Afghanistan",
      AX: "Åland Islands",
      AL: "Albania",
      DZ: "Algeria",
      AS: "American Samoa",
      AD: "Andorra",
      AO: "Angola",
      AI: "Anguilla",
      AQ: "Antarctica",
      AG: "Antigua and Barbuda",
      AR: "Argentina",
      AM: "Armenia",
      AW: "Aruba",
      AU: "Australia",
      AT: "Austria",
      AZ: "Azerbaijan",
      BS: "Bahamas",
      BH: "Bahrain",
      BD: "Bangladesh",
      BB: "Barbados",
      BY: "Belarus",
      BE: "Belgium",
      BZ: "Belize",
      BJ: "Benin",
      BM: "Bermuda",
      BT: "Bhutan",
      BO: "Bolivia",
      BQ: "Bonaire, Sint Eustatius and Saba",
      BA: "Bosnia and Herzegovina",
      BW: "Botswana",
      BV: "Bouvet Island",
      BR: "Brazil",
      IO: "British Indian Ocean Territory",
      BN: "Brunei Darussalam",
      BG: "Bulgaria",
      BF: "Burkina Faso",
      BI: "Burundi",
      KH: "Cambodia",
      CM: "Cameroon",
      CA: "Canada",
      CV: "Cape Verde",
      KY: "Cayman Islands",
      CF: "Central African Republic",
      TD: "Chad",
      CL: "Chile",
      CN: "China",
      CX: "Christmas Island",
      CC: "Cocos (Keeling) Islands",
      CO: "Colombia",
      KM: "Comoros",
      CG: "Congo",
      CD: "Congo, Democratic Republic of the Congo",
      CK: "Cook Islands",
      CR: "Costa Rica",
      CI: "Côte d'Ivoire",
      HR: "Croatia",
      CU: "Cuba",
      CW: "Curaçao",
      CY: "Cyprus",
      CZ: "Czech Republic",
      DK: "Denmark",
      DJ: "Djibouti",
      DM: "Dominica",
      DO: "Dominican Republic",
      EC: "Ecuador",
      EG: "Egypt",
      SV: "El Salvador",
      GQ: "Equatorial Guinea",
      ER: "Eritrea",
      EE: "Estonia",
      ET: "Ethiopia",
      FK: "Falkland Islands (Malvinas)",
      FO: "Faroe Islands",
      FJ: "Fiji",
      FI: "Finland",
      FR: "France",
      GF: "French Guiana",
      PF: "French Polynesia",
      TF: "French Southern Territories",
      GA: "Gabon",
      GM: "Gambia",
      GE: "Georgia",
      DE: "Germany",
      GH: "Ghana",
      GI: "Gibraltar",
      GR: "Greece",
      GL: "Greenland",
      GD: "Grenada",
      GP: "Guadeloupe",
      GU: "Guam",
      GT: "Guatemala",
      GG: "Guernsey",
      GN: "Guinea",
      GW: "Guinea-Bissau",
      GY: "Guyana",
      HT: "Haiti",
      HM: "Heard Island and McDonald Islands",
      VA: "Holy See (Vatican City State)",
      HN: "Honduras",
      HK: "Hong Kong",
      HU: "Hungary",
      IS: "Iceland",
      IN: "India",
      ID: "Indonesia",
      IR: "Iran, Islamic Republic of Persian Gulf",
      IQ: "Iraq",
      IE: "Ireland",
      IM: "Isle of Man",
      IL: "Israel",
      IT: "Italy",
      JM: "Jamaica",
      JP: "Japan",
      JE: "Jersey",
      JO: "Jordan",
      KZ: "Kazakhstan",
      KE: "Kenya",
      KI: "Kiribati",
      KP: "Korea, Democratic People's Republic of Korea",
      KR: "Korea, Republic of South Korea",
      KW: "Kuwait",
      KG: "Kyrgyzstan",
      LA: "Lao People's Democratic Republic",
      LV: "Latvia",
      LB: "Lebanon",
      LS: "Lesotho",
      LR: "Liberia",
      LY: "Libya",
      LI: "Liechtenstein",
      LT: "Lithuania",
      LU: "Luxembourg",
      MO: "Macao",
      MK: "Macedonia",
      MG: "Madagascar",
      MW: "Malawi",
      MY: "Malaysia",
      MV: "Maldives",
      ML: "Mali",
      MT: "Malta",
      MH: "Marshall Islands",
      MQ: "Martinique",
      MR: "Mauritania",
      MU: "Mauritius",
      YT: "Mayotte",
      MX: "Mexico",
      FM: "Micronesia, Federated States of Micronesia",
      MD: "Moldova, Republic of Moldova",
      MC: "Monaco",
      MN: "Mongolia",
      ME: "Montenegro",
      MS: "Montserrat",
      MA: "Morocco",
      MZ: "Mozambique",
      MM: "Myanmar",
      NA: "Namibia",
      NR: "Nau",
      NP: "Nepal",
      NL: "Netherlands",
      NC: "New Caledonia",
      NZ: "New Zealand",
      NI: "Nicaragua",
      NE: "Niger",
      NG: "Nigeria",
      NU: "Niue",
      NF: "Norfolk Island",
      MP: "Northern Mariana Islands",
      NO: "Norway",
      OM: "Oman",
      PK: "Pakistan",
      PW: "Palau",
      PS: "Palestinian Territory, Occupied",
      PA: "Panama",
      PG: "Papua New Guinea",
      PY: "Paraguay",
      PE: "Peru",
      PH: "Philippines",
      PN: "Pitcairn",
      PL: "Poland",
      PT: "Portugal",
      PR: "Puerto Rico",
      QA: "Qatar",
      RE: "Reunion",
      RO: "Romania",
      RU: "Russian Federation",
      RW: "Rwanda",
      BL: "Saint Barthélemy",
      SH: "Saint Helena, Ascension and Tristan da Cunha",
      KN: "Saint Kitts and Nevis",
      LC: "Saint Lucia",
      MF: "Saint Martin (French part)",
      PM: "Saint Pierre and Miquelon",
      VC: "Saint Vincent and the Grenadines",
      WS: "Samoa",
      SM: "San Marino",
      ST: "Sao Tome and Principe",
      SA: "Saudi Arabia",
      SN: "Senegal",
      RS: "Serbia",
      SC: "Seychelles",
      SL: "Sierra Leone",
      SG: "Singapore",
      SX: "Sint Maarten (Dutch part)",
      SK: "Slovakia",
      SI: "Slovenia",
      SB: "Solomon Islands",
      SO: "Somalia",
      ZA: "South Africa",
      GS: "South Georgia and the South Sandwich Islands",
      SS: "South Sudan",
      ES: "Spain",
      LK: "Sri Lanka",
      SD: "Sudan",
      SR: "Suriname",
      SJ: "Svalbard and Jan Mayen",
      SZ: "Swaziland",
      SE: "Sweden",
      CH: "Switzerland",
      SY: "Syrian Arab Republic",
      TW: "Taiwan",
      TJ: "Tajikistan",
      TZ: "Tanzania, United Republic of Tanzania",
      TH: "Thailand",
      TL: "Timor-Leste",
      TG: "Togo",
      TK: "Tokelau",
      TO: "Tonga",
      TT: "Trinidad and Tobago",
      TN: "Tunisia",
      TR: "Turkey",
      TM: "Turkmenistan",
      TC: "Turks and Caicos Islands",
      TV: "Tuvalu",
      UG: "Uganda",
      UA: "Ukraine",
      AE: "United Arab Emirates",
      GB: "United Kingdom",
      US: "United States",
      UM: "United States Minor Outlying Islands",
      UY: "Uruguay",
      UZ: "Uzbekistan",
      VU: "Vanuatu",
      VE: "Venezuela, Bolivarian Republic of Venezuela",
      VN: "Vietnam",
      VG: "Virgin Islands, British",
      VI: "Virgin Islands, U.S.",
      WF: "Wallis and Futuna",
      EH: "Western Sahara",
      YE: "Yemen",
      ZM: "Zambia",
      ZW: "Zimbabwe",
    };

    return countryCodes[code] || code;
  }
}

module.exports = ClickModel;
