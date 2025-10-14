import React, { useEffect, useRef, useState } from "react";
import UploadImage from "../assets/uploadwhite.png";
import TriggerAnalysis from "../assets/triggerwhite.png";
import Dropdown from "../assets/dropdown.png";
import { columns } from "../data/sidebarItems";
import UploadModal from "../components/UploadModal.jsx";
import api from "../api.jsx";
import EyeImage from "../assets/eyeimage.png";
import { toast } from "react-toastify";
import LeftArrow from "../assets/leftarrow.png";
import RightArrow from "../assets/rightarrow.png";
import DetailedReport from "../components/DetailedReport.jsx";
import NodeScore from "../components/NodeScore.jsx";
import ProtocolMix from "../components/ProtocolMix.jsx";

const CallFailureDetection = ({
  callFailureData,
  setCallFailureData,
  formData,
  setFormData,
  apiCalled,
  setApiCalled,
  testCaseId,
  setTestCaseId,
  expandedIndex,
  setExpandedIndex,
  allData: propAllData,
  setAllData: setPropAllData,
}) => {


  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Select column...");
  const [searchValue, setSearchValue] = useState("");
  const [isUploadModal, setUploadModal] = useState(false);
  const [isReportModal, setReportModal] = useState(false);
  const [isNodeScoreModal, setNodeScoreModal] = useState(false);
  const [isProtocolMixModal, setProtocolMixModal] = useState(false);
  const [key, setKey] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const perPage = 5;

  const filterRef = useRef(null);

  const allData = propAllData;

  //fetches total records and based on that fetches entire entire details of all those records and storing in allData. ( fetches only once if there is no data)
  const fetchAllData = async () => {
    try {

      const totalResp = await api.get(`/ui_summary_report?startpage=1&limit=1&per_page=${perPage}`);
      
      const totalRecordsFromApi = totalResp.data.total_records || 0;
      setTotalRecords(totalRecordsFromApi);

      if (totalRecordsFromApi === 0) return;
      
      const resp = await api.get(`/ui_summary_report?startpage=1&limit=1&per_page=${totalRecordsFromApi}`);

      const pageData = (resp.data.data.pages || []).flat().reverse();

      setPropAllData(pageData);
      setCurrentPage(1);
      return pageData;

    } catch (err) {
      console.error("Error fetching all data:", err);
      return [];
    }
  };

  useEffect(() => {
    if (allData.length === 0) fetchAllData();
  }, []);


  //changes the current page to 1 whenever any value ( searchValue or key ) changes in filter. because if current page is 
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, key]);

  // used to call the fetch api for every 3s to check whether the call status is updated
  const time = 3000
  useEffect(() => {

    if (isAnalyzing && testCaseId) {

      let interval, pollCount = 0;
      const maxPolls = 40;

      interval = setInterval( async () => {

        // Fetches entire latest data.
        const pageData = await fetchAllData();
        pollCount++;

        // Check if new entry has call_status populated
        const newEntry = pageData.find((item) => item.testcase_id === testCaseId && item.calls?.[0]?.call_status);

        if (newEntry || pollCount >= maxPolls) {

          setIsAnalyzing(false);
          clearInterval(interval);
          setApiCalled(true);
          // Show success or timeout message
          toast.success(newEntry ? `✅ Analysis complete!.` : `⏰ Analysis timeout. Please refresh manually.`);
          // // Final fetch to update UI
          // await fetchAllData();
        }
      }, time);

      return () => clearInterval(interval);
    }
  }, [isAnalyzing, testCaseId]);

  // Function to filter data based on search value and selected column
  const filteredData = () => {

    let data = allData;

    if (searchValue) {
      if (selected !== "Select column..." && key) {

        // Specific column filter
        data = data.filter((item) => {
          if (key === "call_status") {
            // Handle nested call_status
            return item.calls?.[0]?.call_status?.toString().toLowerCase().includes(searchValue.toLowerCase());
          }

          return item[key]?.toString().toLowerCase().includes(searchValue.toLowerCase());
        });
      } else {

        // Global search across all fields, including nested call_status
        data = data.filter((item) => {

          const searchableValues = Object.values(item).map((val) => {

            if (Array.isArray(val) && val.length > 0 && val[0]?.call_status) {
              return val[0]?.call_status?.toString();
            }

            return val?.toString();

          });

          return searchableValues.join(" ").toLowerCase().includes(searchValue.toLowerCase());
        });
      }
    }
    return data;
  };

  // Function to get data slice for current page
  const displayData = () => {
    const startIndex = (currentPage - 1) * perPage;
    return filteredData().slice(startIndex, startIndex + perPage);
  };
  

  // Function to calculate total pages based on filtered data
  const totalPages = () => Math.ceil(filteredData().length / perPage);

  // Handler to toggle row expansion
  const handleDropdown = (index) => setExpandedIndex(expandedIndex === index ? null : index);

  // Handler for column selection in filter dropdown
  const handleSelect = (column, colkey) => {
    setKey(colkey);
    setSelected(column);
    setIsOpen(false);
  };

  // Handler to close upload modal
  const handleUploadClose = () => setUploadModal(false);
  // Handler to close report modal
  const handleReportClose = () => setReportModal(false);
  // Handler to open upload modal
  const handleOpenUploadModal = () => setUploadModal(true);

  // Handler to trigger analysis API call and start polling
  const handleTriggerAnalysis = async () => {
    if (!formData) return;
    setApiCalled(true);
    setIsAnalyzing(true);
    toast.info("🔄 Analysis started. This may take a few moments...");
  };

  // Handler to open node score modal from report
  const handleOpenNodeScore = () => {
    setReportModal(false);
    setNodeScoreModal(true);
  };

  // Handler to close node score modal
  const handleNodeScoreClose = () => setNodeScoreModal(false);
  // Handler to navigate back to details from node score
  const handleBackToDetailsFromNodeScore = () => {
    setNodeScoreModal(false);
    setReportModal(true);
  };

  // Handler to open protocol mix modal from report
  const handleOpenProtocolMix = () => {
    setReportModal(false);
    setProtocolMixModal(true);
  };

  // Handler to close protocol mix modal
  const handleProtocolMixClose = () => setProtocolMixModal(false);
  // Handler to navigate back to details from protocol mix
  const handleBackToDetailsFromProtocol = () => {
    setProtocolMixModal(false);
    setReportModal(true);
  };

  // Effect to close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    
    <div className="flex flex-col bg-gray-100 pt-9 pl-5 w-full min-h-screen">
      
      {/* Main title */}
      <h1 className="text-4xl text-blue-800">TELE-ANALYZER</h1>

      {/* Upload and Trigger buttons row */}
      <div className="flex mt-4 space-x-6 justify-start text-white">

        <button
          className="flex items-center gap-2 bg-blue-800 py-1.5 px-1 rounded-md hover:bg-blue-900 transition cursor-pointer"
          onClick={handleOpenUploadModal}
        >
          <img src={UploadImage} className="w-6" alt="upload" />
          <span className="mr-1">Upload PCAP</span>
        </button>

        <button
          className={`flex items-center gap-2 py-1.5 px-1 rounded-md transition ${
            !formData || apiCalled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-400 hover:bg-blue-500 cursor-pointer"
          }`}
          disabled={!formData || apiCalled}
          title={!formData || apiCalled ? "Please upload PCAP to trigger analysis" : ""}
          onClick={handleTriggerAnalysis}
        >
          <img src={TriggerAnalysis} className="w-6" alt="trigger" />
          <span className="mr-1">Trigger Analysis</span>
        </button>
        
      </div>

      {/* Filter and Search section */}
      <div className="w-full flex mt-6 space-x-4 items-center relative">

        <div className="flex flex-col flex-1 relative" ref={filterRef}>

          <label className="text-sm text-gray-500 mb-1 font-medium">Filter by Column</label>
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="relative flex items-center justify-between p-2 px-3 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer transition"
          >
            <span className="text-gray-700">{selected}</span>
            <img
              src={Dropdown}
              alt="dropdown"
              className={`w-3 duration-200 mt-1.5 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>

          {/* Filter dropdown options */}
          {isOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto z-10">
              {Object.entries(columns).map(([colKey, value]) => (
                <div
                  key={colKey}
                  onClick={() => handleSelect(value, colKey)}
                  className="px-3 py-2 text-gray-700 hover:bg-blue-800 hover:text-white cursor-pointer transition rounded-md m-1"
                >
                  {value}
                </div>
              ))}
            </div>
          )}

        </div>

        <div className="flex flex-col flex-1">
          <label className="text-sm text-gray-500 mb-1 font-medium">Search</label>
          <input
            type="text"
            className="p-2 bg-white px-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-300 outline-none transition"
            placeholder="Search all columns..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        {/* Clear filters button */}
        <button
          className="flex-none px-4 py-2 mt-5 mr-6 rounded-md border border-transparent hover:border-red-400 hover:text-red-400 transition hover:cursor-pointer shadow-sm"
          onClick={() => {
            setSelected("Select column...");
            setSearchValue("");
            setKey("");
          }}
        >
          Clear
        </button>
      </div>

      {/* table section */}
      <div className="mt-6 overflow-x-auto pr-6">
        {allData.length === 0 ? (
          <div className="text-center p-6 text-gray-600">
            {/* Loading or analyzing message */}
            {isAnalyzing ? "🔄 Analyzing..." : totalRecords === 0 ? "Please Upload PCAP to see analysis" : "Loading data..."}
          </div>
        ) : filteredData().length === 0 ? (
          <div className="text-center p-6 text-gray-600">
            No results found for the selected filter/search.
          </div>
        ) : (
          <table className="min-w-full shadow-sm text-sm overflow-hidden rounded-t-md">
            {/* Table header */}
            <thead className="bg-blue-800 text-white rounded-t-md">
              <tr>
                <td className="p-2 text-center font-semibold w-32">Actions</td>
                <td className="p-2 text-center font-semibold w-48">TestCase ID</td>
                <td className="p-2 text-center font-semibold w-56">Timestamp</td>
                <td className="p-2 text-center font-semibold w-40">Uploaded By</td>
                <td className="p-2 text-center font-semibold w-48">Comments</td>
                <td className="p-2 text-center font-semibold w-40">Call Status</td>
              </tr>
            </thead>

            <tbody>
              {/* Map over paginated data rows */}
              {displayData().map((data, index) => (
                <React.Fragment key={data.testcase_id}>
                  
                  {/* Main row */}
                  <tr className={`${index % 2 === 0 ? "bg-blue-100" : "bg-blue-50"} hover:bg-blue-200 transition`}>
                    <td className="p-2 text-center">

                      <div className="items-center">

                        {/* Expand/collapse button */}
                        <button className="hover:cursor-pointer mr-2" onClick={() => handleDropdown(index)}>
                          <img
                            src={Dropdown}
                            alt="expand"
                            className={`w-3 transition-all duration-300 ease-in-out ${expandedIndex === index ? "-rotate-90" : ""}`}
                          />
                        </button>

                        {/* View details button */}
                        <button
                          className="hover:cursor-pointer"
                          onClick={() => {
                            setReportModal(true);
                            setTestCaseId(data.testcase_id);
                          }}
                        >
                          <img src={EyeImage} alt="view" className="w-4" />
                        </button>

                      </div>

                    </td>
                    <td className="p-2 text-center">{data.testcase_id}</td>
                    <td className="p-2 text-center">{data.created_at}</td>
                    <td className="p-2 text-center">{data.uploaded_by}</td>
                    <td className="py-2 text-center">{data.comments}</td>
                    <td className="p-2 text-center">{data.calls?.[0]?.call_status || "Status in progress..."}</td>

                  </tr>

                  {/* Expanded row for details (if toggled) */}
                  {expandedIndex === index && (
                    <tr>
                      <td colSpan={6} className="bg-gray-200 p-4 border-t border-gray-300">

                        {/* Conditional header for failure details */}
                        <h2 className="text-blue-800 font-semibold mb-2">
                          {data.calls?.[0]?.call_status === 'fail' && 'PCAP Summary Details'}
                        </h2>

                        {data.calls?.[0]?.call_status === "fail" ? (
                          // Nested table for node/protocol errors
                          <table className="w-full border border-gray-300 overflow-hidden rounded-t-md">
                            <thead className="bg-blue-800 text-white">
                              <tr>
                                <td className="p-2 text-center font-semibold w-8">#</td>
                                <td className="p-2 text-center font-semibold w-48">Nodes</td>
                                <td className="p-2 text-center font-semibold w-24">Protocol</td>
                                <td className="p-2 text-left font-semibold">Protocol Error Details</td>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Map over nodes or show loading */}
                              {data.calls?.[0]?.nodes?.length > 0 ? (
                                data.calls[0].nodes.map((item, idx) => (
                                  <tr
                                    key={idx}
                                    className={`${
                                      idx === 0 ? 'bg-red-700/20' : idx % 2 === 0 ? "bg-blue-100" : "bg-blue-50"
                                    }`}
                                  >
                                    <td className="p-2 text-center">{idx + 1}</td>
                                    <td className="p-2 text-center">
                                      <div className={`inline-block rounded-md p-0.5 ${idx === 0 ? 'text-red-700 font-semibold flex flex-col' : ''}  `}>
                                        <p>{idx === 0 ? 'Root Node' : ''}</p>
                                        <p>{item.node_name}</p>
                                      </div>
                                    </td>
                                    <td className="p-2 text-center">{item.protocol}</td>
                                    <td className="p-2 text-left">{item.error_details}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="p-2 text-center">Loading details...</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        ) : (
                          // Success or pending message
                          <div className="flex justify-center items-center -mt-2 mb-1">
                            {data.calls?.[0]?.call_status ? "No errors found based on PCAP analysis" : "Loading status..."}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages() >= 1 && (
        <div className="flex bg-gray-100 p-3 justify-center items-center gap-2 mt-4 pb-6">
          {/* Previous button */}
          <button
            className={`px-3 py-2 rounded-md border ${
              currentPage === 1 ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-blue-800 border-blue-600 hover:bg-blue-100 cursor-pointer"
            }`}
            disabled={currentPage === 1}
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
                setExpandedIndex(null);
              }
            }}
          >
            <img src={LeftArrow} alt="previousButton" className="w-3" />
          </button>

          {/* Page number buttons with ellipsis */}
          {Array.from({ length: totalPages() }, (_, i) => i + 1)
            .filter((page) => page === 1 || page === totalPages() || (page <= currentPage + 1 && page >= currentPage - 1))
            .map((page, idx, arr) => (
              <React.Fragment key={page}>
                {idx > 0 && arr[idx - 1] !== page - 1 && <span>...</span>}
                <button
                  onClick={() => { setCurrentPage(page); setExpandedIndex(null); }}
                  className={`px-3 py-1 rounded-md border transition cursor-pointer ${
                    currentPage === page ? "bg-blue-800 text-white border-blue-800" : "bg-white text-gray-800 hover:bg-blue-100 border-gray-400"
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            ))}

          {/* Next button */}
          <button
            className={`px-3 py-2 rounded-md border ${
              currentPage === totalPages() ? "text-gray-400 border-gray-300 cursor-not-allowed" : "text-blue-800 border-blue-600 hover:bg-blue-100 cursor-pointer"
            }`}
            disabled={currentPage === totalPages()}
            onClick={() => {
              if (currentPage < totalPages()) {
                setCurrentPage(currentPage + 1);
                setExpandedIndex(null);
              }
            }}
          >
            <img src={RightArrow} alt="nextButton" className="w-3" />
          </button>
        </div>
      )}

      {/* Conditional modals */}
      {isUploadModal && (
        <UploadModal onClose={handleUploadClose} setFormData={setFormData} setApiCalled={setApiCalled} setTestCaseId={setTestCaseId} />
      )}

      {isReportModal && (
        <DetailedReport testCaseId={testCaseId} onClose={handleReportClose} onOpenNodeScore={handleOpenNodeScore} onOpenProtocolMix={handleOpenProtocolMix} />
      )}

      {isNodeScoreModal && (
        <NodeScore testCaseId={testCaseId} onClose={handleNodeScoreClose} onBackToDetails={handleBackToDetailsFromNodeScore} />
      )}

      {isProtocolMixModal && (
        <ProtocolMix testCaseId={testCaseId} onClose={handleProtocolMixClose} onBackToDetails={handleBackToDetailsFromProtocol} />
      )}
    </div>
  );
};

export default CallFailureDetection;