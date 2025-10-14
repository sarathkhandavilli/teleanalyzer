import React, { useEffect, useState, useRef } from "react";
import api from "../api.jsx";
import CloseIcon from "../assets/close.png";
import {
  Chart as ChartJS,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
} from "chart.js";

ChartJS.register(BarElement, Tooltip, Legend, CategoryScale, LinearScale, Title);

const ProtocolMix = ({ testCaseId, onClose, onBackToDetails }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [protocolCounts, setProtocolCounts] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const isInitialRender = useRef(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await api.get(
          `get_detailed_report?TestCaseId=${testCaseId}`
        );
        if (response.status === 200) {
          setReportData(response.data);
          const callNodes = response.data.calls?.[0]?.nodes || [];

          // Count protocols
          const protocolMap = {};
          callNodes.forEach((node) => {
            const proto = node.protocol;
            protocolMap[proto] = (protocolMap[proto] || 0) + 1;
          });

          // Convert to array and sort by count descending
          const sortedProtocols = Object.entries(protocolMap)
            .map(([protocol, count]) => ({ protocol, count }))
            .sort((a, b) => b.count - a.count);
          setProtocolCounts(sortedProtocols);
        }
      } catch (error) {
        console.error("Error fetching protocol mix data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (testCaseId) fetchReportData();
  }, [testCaseId]);

  useEffect(() => {
    if (chartRef.current && protocolCounts.length > 0) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const labels = protocolCounts.map((item) => item.protocol);
      const data = protocolCounts.map((item) => item.count);

      const colors = [
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 99, 132, 0.6)",
        "rgba(255, 206, 86, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(153, 102, 255, 0.6)",
        "rgba(255, 159, 64, 0.6)",
      ];

      const chartConfig = {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Protocol Count",
              data: data,
              backgroundColor: colors.slice(0, labels.length),
              borderColor: colors.slice(0, labels.length).map((c) => c.replace("0.6", "1")),
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: isInitialRender.current ? { duration: 1000 } : false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Protocol Mix (Bar Chart)",
              font: { size: 16 },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage =
                    total > 0
                      ? ((context.parsed.y / total) * 100).toFixed(1)
                      : 0;
                  return `${context.label}: ${context.parsed.y} (${percentage}%)`;
                },
              },
            },
          },
          scales: {
            x: {
              title: { display: true, text: "Protocol" },
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: "Count" },
              ticks: { stepSize: 1 },
            },
          },
        },
      };

      chartInstance.current = new ChartJS(chartRef.current, chartConfig);
      isInitialRender.current = false;
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [protocolCounts]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-4 shadow-md text-gray-700">
          Loading protocol mix...
        </div>
      </div>
    );
  }

  if (!protocolCounts.length) {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-4 shadow-md text-gray-700">
          No protocol data found.
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 flex justify-center items-center p-2 ">
      <div className="bg-white rounded-xl shadow-lg w-[60%] max-w-3xl max-h-[80vh] overflow-y-auto p-4 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h1 className="text-xl font-semibold text-blue-800">Visual</h1>
          <button onClick={onClose} className="hover:cursor-pointer text-gray-500 text-2xl hover:text-red-600">
            &times;
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Protocol Mix - {testCaseId}
          </h2>
          <p className="text-sm text-gray-600">Protocol Mix</p>
        </div>

        {/* Chart */}
        <div className="mb-6" style={{ position: "relative", height: "300px" }}>
          <canvas ref={chartRef}></canvas>
        </div>

        {/* Back Button */}
        {onBackToDetails && (
          <div className="flex justify-end mt-4">
            <button
              onClick={onBackToDetails}
              className="px-4 py-2 bg-blue-600 hover:cursor-pointer text-white rounded-md hover:bg-blue-700"
            >
              Back to Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtocolMix;
