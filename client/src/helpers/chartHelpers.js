import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
);

// Chart Helper Functions
export const renderDoughnutChart = (canvasId, chartData, chartColors = []) => {
  if (!chartData) return;

  // Destroy existing chart if it exists
  const existingChart = ChartJS.getChart(canvasId);
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = document.getElementById(canvasId)?.getContext("2d");
  if (ctx) {
    new ChartJS(ctx, {
      type: "doughnut",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.data,
            backgroundColor:
              chartColors.length > 0
                ? chartColors
                : [
                    "#F59E0B", // warm soft amber/orange
                    "#A78BFA", // muted purple/lavender
                    "#BAE6FD", // very light blue
                    "#3B82F6", // blue-500
                    "#EF4444", // red-500
                    "#10B981", // emerald-500
                    "#8B5CF6", // violet-500
                    "#EC4899", // pink-500
                    "#6EE7B7", // emerald-300
                    "#93C5FD", // blue-300
                  ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%", // Noticeable inner hollow space
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#6B7280", // Subtle grey color
              font: {
                size: 12,
              },
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true, // Small colored dots
              pointStyle: "circle",
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: "#374151", // gray-700
            titleColor: "#F9FAFB", // gray-50
            bodyColor: "#D1D5DB", // gray-300
            borderColor: "#4B5563", // gray-600
            borderWidth: 1,
          },
        },
      },
    });
  }
};

// Generic Chart with consistent styling
export const renderConsistentDoughnutChart = (
  canvasId,
  chartData,
  centerText = null,
) => {
  if (!chartData) return;

  // Destroy existing chart if it exists
  const existingChart = ChartJS.getChart(canvasId);
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = document.getElementById(canvasId)?.getContext("2d");
  if (ctx) {
    new ChartJS(ctx, {
      type: "doughnut",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.data,
            backgroundColor: [
              "#F59E0B", // warm soft amber/orange
              "#A78BFA", // muted purple/lavender
              "#BAE6FD", // very light blue
              "#3B82F6", // blue-500
              "#EF4444", // red-500
              "#10B981", // emerald-500
              "#8B5CF6", // violet-500
              "#EC4899", // pink-500
              "#6EE7B7", // emerald-300
              "#93C5FD", // blue-300
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%", // Noticeable inner hollow space
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true, // Small colored dots
              pointStyle: "circle",
              padding: 20,
              font: {
                size: 12,
                family: "sans-serif",
              },
              color: "#6B7280", // Subtle grey color
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${percentage}%`;
              },
            },
          },
          // Plugin to draw the center text (if provided)
          centerText: {
            display: !!centerText,
            text: centerText || [],
            color: "#9CA3AF", // Subtle grey/muted tone
            font: {
              size: 12,
              family: "sans-serif",
            },
          },
          // Plugin to display percentages inside slices
          datalabels: {
            display: true,
            color: "#FFFFFF",
            font: {
              weight: "normal",
              size: 12,
            },
          },
        },
        animation: {
          animateRotate: true,
        },
      },
      plugins: [
        {
          id: "centerText",
          beforeDraw: function (chart) {
            if (
              chart.options.plugins.centerText &&
              chart.options.plugins.centerText.display
            ) {
              const ctx = chart.ctx;
              const chartArea = chart.chartArea;
              const text = chart.options.plugins.centerText.text;
              const color = chart.options.plugins.centerText.color;
              const font = chart.options.plugins.centerText.font;

              ctx.save();
              ctx.font = `${font.size}px ${font.family}`;
              ctx.fillStyle = color;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              const centerX = (chartArea.left + chartArea.right) / 2;
              const centerY = (chartArea.top + chartArea.bottom) / 2;

              // Draw each line of text centered
              text.forEach((line, index) => {
                ctx.fillText(
                  line,
                  centerX,
                  centerY - font.size / 2 + index * font.size,
                );
              });

              ctx.restore();
            }
          },
        },
        {
          id: "datalabels",
          afterDatasetsDraw: function (chart) {
            const showLabels =
              chart.options.plugins.datalabels &&
              chart.options.plugins.datalabels.display;
            if (!showLabels) return;

            const ctx = chart.ctx;
            const datasets = chart.data.datasets;

            datasets.forEach((dataset, datasetIndex) => {
              const metaData = chart.getDatasetMeta(datasetIndex).data;

              ctx.save();
              ctx.font = `${
                chart.options.plugins.datalabels.font.weight || "normal"
              } ${chart.options.plugins.datalabels.font.size}px ${
                chart.options.plugins.datalabels.font.family || "sans-serif"
              }`;
              ctx.fillStyle = chart.options.plugins.datalabels.color;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";

              const total = dataset.data.reduce((a, b) => a + b, 0);

              metaData.forEach((meta, index) => {
                const value = dataset.data[index];
                const percentage = ((value / total) * 100).toFixed(1);
                const midAngle =
                  meta.startAngle + (meta.endAngle - meta.startAngle) / 2;
                const innerRadius = chart.innerRadius;
                const outerRadius = chart.outerRadius;
                const labelRadius =
                  innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = meta.x + Math.cos(midAngle) * labelRadius;
                const y = meta.y + Math.sin(midAngle) * labelRadius;

                ctx.fillText(`${percentage}%`, x, y);
              });
            });

            ctx.restore();
          },
        },
      ],
    });
  }
};

// Device Distribution Chart
export const renderDeviceDistributionChart = (canvasId, chartData) => {
  renderConsistentDoughnutChart(canvasId, chartData, ["By", "Devices"]);
};

// OS Distribution Chart
export const renderOSDistributionChart = (canvasId, chartData) => {
  renderConsistentDoughnutChart(canvasId, chartData, ["By", "OS"]);
};

// Location Distribution Chart
export const renderLocationDistributionChart = (canvasId, chartData) => {
  renderConsistentDoughnutChart(canvasId, chartData, ["By", "Location"]);
};

export const defaultChartColors = [
  "#3B82F6", // blue-500
  "#EF4444", // red-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#6EE7B7", // emerald-300
  "#93C5FD", // blue-300
  "#F87171", // red-300
  "#A78BFA", // violet-300
];

// Traffic Over Time Chart
export const renderTrafficChart = (canvasId, chartData) => {
  if (!chartData) return;

  // Destroy existing chart if it exists
  const existingChart = ChartJS.getChart(canvasId);
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = document.getElementById(canvasId)?.getContext("2d");
  if (ctx) {
    new ChartJS(ctx, {
      type: "line",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "Clicks",
            data: chartData.data,
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#3B82F6",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "#E5E7EB",
            },
            ticks: {
              color: "#6B7280",
              font: {
                size: 12,
              },
              callback: function (value) {
                return Number.isInteger(value) ? value : value.toFixed(0);
              },
            },
          },
          x: {
            grid: {
              color: "#E5E7EB",
            },
            ticks: {
              color: "#6B7280",
              font: {
                size: 11,
              },
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#374151",
            titleColor: "#F9FAFB",
            bodyColor: "#D1D5DB",
            borderColor: "#4B5563",
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function (context) {
                const clicks = Number.isInteger(context.parsed.y)
                  ? context.parsed.y
                  : Math.round(context.parsed.y);
                return `Clicks: ${clicks}`;
              },
            },
          },
        },
      },
    });
  }
};

// Referrer Distribution Chart
export const renderReferrerDistributionChart = (canvasId, chartData) => {
  renderConsistentDoughnutChart(canvasId, chartData, ["By", "Referrer"]);
};

// Bot vs Human Traffic Chart
export const renderTrafficTypeChart = (canvasId, chartData) => {
  renderConsistentDoughnutChart(canvasId, chartData, [
    "Human vs",
    "Bot Traffic",
  ]);
};

// Bot Category Distribution Chart
export const renderBotCategoryChart = (canvasId, chartData) => {
  renderConsistentDoughnutChart(canvasId, chartData, ["Bot", "Categories"]);
};

// Specific Bot Distribution Chart
export const renderBotNameChart = (canvasId, chartData) => {
  renderConsistentDoughnutChart(canvasId, chartData, ["Specific", "Bots"]);
};
