import React, { useEffect, useState } from "react";
import api from "../api.jsx";
import ModalHeader from "./ModalHeader.jsx";

const Progress = ({ value }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

const DetailedReport = ({ testCaseId, onClose, onOpenNodeScore, onOpenProtocolMix }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await api.get(`get_detailed_report?TestCaseId=${testCaseId}`);
        if (response.status === 200) {
          setReportData(response.data);
        }
      } catch (error) {
        console.error("Error fetching detailed report:", error);
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
          Loading detailed report...
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-4 shadow-md text-gray-700">
          No report found.
        </div>
      </div>
    );
  }

  const call = reportData.calls?.[0];
  const nodes = call?.nodes || [];
  const maxScore = 2.0;

  return (
    <div className="modalOuterDiv">
      <div className="modalInnerDiv">
        
        {/* Header */}
        <ModalHeader heading={`Detailed Error Report - ${reportData.testcase_id}`} onClose={onClose} />

        {/* Summary Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-sm">
          <div className="ml-2">
            <p className="text-gray-500">Call Status</p>
            <p className="font-semibold text-gray-800 capitalize">{call?.call_status || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-500">Root Node</p>
            <p className="font-semibold text-gray-800">{call?.root_node || nodes[0]?.node_name || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Nodes</p>
            <p className="font-semibold text-gray-800">{nodes.length}</p>
          </div>

        </div>

        {/* Node Details */}
        <div className="space-y-3">
        {call.call_status?.toLowerCase() === "success" ? (
            <div className="flex justify-center items-center h-32 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-gray-500 font-medium">No error details found</p>
            </div>
        ) : (
            nodes.map((node, index) => (
            <div key={index} className="rounded-lg border border-gray-200 shadow-sm">
                <div className="bg-gray-50 px-3 py-2 border-b">
                <h3 className="font-semibold text-blue-700">
                    Rank {index + 1}: {node.node_name}
                </h3>
                </div>
                <div className="px-3 py-2 space-y-2">
                {/* Final Score */}
                <div>
                    <p className="text-gray-500 text-sm mb-1">Anomoly Score</p>
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                        <Progress value={(node.final_score) * 100} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap ml-2">
                        {node.final_score.toFixed(2)} / {maxScore}
                        </span>
                    </div>
                </div>


                {/* Protocol */}
                <div>
                    <p className="text-gray-500 text-sm">Protocol</p>
                    <p className="font-medium text-gray-800 uppercase">{node.protocol}</p>
                </div>

                {/* Error Details */}
                <div>
                    <p className="text-gray-500 text-sm">Error Details</p>
                    <p className="text-gray-700 text-sm bg-gray-100 p-2 rounded-md">
                    {node.error_details}
                    </p>
                </div>
                </div>
            </div>
            ))
        )}
        </div>


        {/* RCA Report */}
        <div className="mt-4">
          <h2 className="text-blue-800 font-semibold mb-1">RCA Report</h2>
          <p className="text-gray-700 bg-gray-50 p-2 rounded-md">{call?.rca_report || "No report available"}</p>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onOpenNodeScore}
            className="px-3 py-1 bg-blue-700 hover:cursor-pointer  hover:bg-blue-800 text-white rounded-md text-sm"
          >
            Node Score
          </button>
          <button 
            onClick={onOpenProtocolMix}
            className="px-3 py-1 bg-green-700 hover:cursor-pointer  hover:bg-green-800 text-white rounded-md text-sm"
          >
            Protocol Mix
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailedReport;