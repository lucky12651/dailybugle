import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js/auto";

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
                  ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#D1D5DB", // gray-300
              font: {
                size: 12,
              },
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
