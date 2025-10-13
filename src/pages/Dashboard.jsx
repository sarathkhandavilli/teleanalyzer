import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = ({ allData }) => {
  const [summary, setSummary] = useState({
    totalPcaps: 0,
    totalFail: 0,
    totalPass: 0,
    protocols: {},
  });

  useEffect(() => {
    const pages = allData || [];
    const totalPcaps = pages.length;
    const totalFail = pages.filter(
      (p) => p.calls?.[0]?.call_status === "fail"
    ).length;
    const totalPass = pages.filter(
      (p) => p.calls?.[0]?.call_status === "success"
    ).length;

    const protocolsCount = {};
    pages.forEach((p) => {
      if (p.calls?.[0]?.call_status === "fail") {
        p.calls?.[0]?.nodes?.forEach((n) => {
          if (n.protocol) {
            protocolsCount[n.protocol] =
              (protocolsCount[n.protocol] || 0) + 1;
          }
        });
      }
    });

    setSummary({
      totalPcaps,
      totalFail,
      totalPass,
      protocols: protocolsCount,
    });
  }, [allData]);

  const { totalPcaps, totalFail, totalPass, protocols } = summary;

  // ===== PIE CHART (Status Split) =====
  const pieData = {
    labels: ["Fail", "Pass"],
    datasets: [
      {
        data: [totalFail, totalPass],
        backgroundColor: ["rgba(239,68,68,0.7)", "rgba(34,197,94,0.7)"],
        borderColor: ["rgba(239,68,68,1)", "rgba(34,197,94,1)"],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.parsed;
            const percent = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${value} (${percent}%)`;
          },
        },
      },
      title: {
        display: true,
        text: "Status Split",
        font: { size: 16 },
      },
    },
  };

  // ===== BAR CHART (Protocol Mix) =====
  const barData = {
    labels: Object.keys(protocols),
    datasets: [
      {
        label: "Count",
        data: Object.values(protocols),
        backgroundColor: "rgba(59,130,246,0.6)",
        borderColor: "rgba(59,130,246,1)",
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Protocol Mix (Failure PCAPs)",
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed.y || context.parsed}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Protocol",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
        },
      },
    },
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-blue-800 mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 border-l-4 border-blue-500 rounded-md p-4">
          <p className="text-sm text-gray-500">Total number of PCAPs</p>
          <h2 className="text-3xl font-bold text-blue-700">{totalPcaps}</h2>
        </div>

        <div className="bg-red-100 border-l-4 border-red-500 rounded-md p-4">
          <p className="text-sm text-gray-500">Total number of Failure PCAPs</p>
          <h2 className="text-3xl font-bold text-red-700">{totalFail}</h2>
        </div>

        <div className="bg-green-100 border-l-4 border-green-500 rounded-md p-4">
          <p className="text-sm text-gray-500">Total number of Pass PCAPs</p>
          <h2 className="text-3xl font-bold text-green-700">{totalPass}</h2>
        </div>

        <div className="bg-gray-100 border-l-4 border-gray-400 rounded-md p-4">
          <p className="text-sm text-gray-600">Protocols seen in failure pcaps</p>
          <h2 className="text-md font-semibold text-gray-700">
            {Object.entries(protocols)
              .map(([p, c]) => `${p.toLowerCase()}:${c}`)
              .join(", ") || "N/A"}
          </h2>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg p-4 shadow-md h-96 flex flex-col justify-center">
          <Pie data={pieData} options={pieOptions} />
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg p-4 shadow-md h-96 flex flex-col justify-center">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;