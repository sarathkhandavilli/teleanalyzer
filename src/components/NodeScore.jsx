import React, { useEffect, useState } from "react";
import api from "../api.jsx";
import CloseIcon from "../assets/close.png";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const NodeScore = ({ testCaseId, onClose, onBackToDetails }) => {

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await api.get(`get_detailed_report?TestCaseId=${testCaseId}`);
        if (response.status === 200) {
          setReportData(response.data);
          const callNodes = response.data.calls?.[0]?.nodes || [];
          const sortedNodes = [...callNodes].sort((a, b) => b.final_score - a.final_score);
          setNodes(sortedNodes);
        }
      } catch (error) {
        console.error("Error fetching node score data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (testCaseId) fetchReportData();
  }, [testCaseId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-4 shadow-md text-gray-700">
          Loading node scores...
        </div>
      </div>
    );
  }

  if (!nodes.length) {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-4 shadow-md text-gray-700">
          No node scores found.
        </div>
      </div>
    );
  }

  // Prepare chart data
  const data = {
    labels: nodes.map(node => node.node_name),
    datasets: [
      {
        label: "Final Score",
        data: nodes.map(node => node.final_score),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    indexAxis: "y", // horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const node = nodes[context.dataIndex];
            return [
              `protocol = ${node.protocol}`,
              `Final Score = ${context.parsed.x}`,
              `Node = ${node.node_name}`,
            ];
          },
        },
      },
      title: {
        display: true,
        text: "Node Final Scores",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 2,
        title: {
          display: true,
          text: "Final Score",
        },
      },
      y: {
        title: {
          display: true,
          text: "Node",
        },
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 flex justify-center items-center p-2 ">
      <div className="bg-white rounded-xl shadow-lg w-[60%] max-w-3xl max-h-[80vh] overflow-y-auto p-4 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h1 className="text-xl font-semibold text-blue-800">Visual</h1>
          <button onClick={onClose} className="text-gray-500 hover:cursor-pointer  text-2xl hover:text-red-600">
            &times;
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Node final scores - {testCaseId}
          </h2>
          <p className="text-sm text-gray-600">Node final scores (ranked)</p>
        </div>

        {/* Chart */}
        <div className="mb-6" style={{ position: "relative", height: "300px" }}>
          <Bar data={data} options={options} />
        </div>

        {/* Back Button */}
        {onBackToDetails && (
          <div className="flex justify-end mt-4">
            <button
              onClick={onBackToDetails}
              className="px-4 py-2 bg-blue-600 hover:cursor-pointer  text-white rounded-md hover:bg-blue-700"
            >
              Back to Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeScore;
