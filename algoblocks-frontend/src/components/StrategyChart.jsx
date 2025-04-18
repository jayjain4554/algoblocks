import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip } from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

export default function StrategyChart({ timestamps, strategy, market }) {
  const data = {
    labels: timestamps,
    datasets: [
      {
        label: "Strategy",
        data: strategy,
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "Market",
        data: market,
        borderColor: "rgb(201, 203, 207)",
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  return <Line data={data} height={120} />;
}
