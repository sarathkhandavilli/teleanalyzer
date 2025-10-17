import React, { useEffect, useState } from "react";
import CloudUpload from "../assets/cloudupload.png";
import UploadImage from "../assets/uploadwhite.png";
import { toast } from "react-toastify";
import api from "../api";
import Select from "react-select";

const UploadModal = ({ onClose, addCallFailureData, setApiCalled, setFormData, setTestCaseId }) => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedZone, setSelectedZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const timeZones = Intl.supportedValuesOf("timeZone");

  const [form, setForm] = useState({
    testCaseId: "",
    file: null,
    uploaded_by: "",
    comments: "",
    timezone: selectedZone,
    start_time: "",
    end_time: "",
    msisdn: "",
    imsi: "",
  });


  const formatDateToString = (date) => {

    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    const hours = String(d.getHours()).padStart(2,'0');
    const miniutes = String(d.getMinutes()).padStart(2,'0');
    const seconds = String(d.getSeconds()).padStart(2,'0');

    return `${year}-${month}-${day} ${hours}:${miniutes}:${seconds}`;

  }

  const handleUpload = async () => {

    try {

      // console.log("time zone = ",form.timezone);
      // console.log("start date = ",formatDateToString(form.start_time));
      // console.log("end date = "+formatDateToString(form.end_time));
      // console.log("msisdn = ",form.msisdn);
      // console.log("imsi = ",form.imsi);

       // Validation for required fields
    if (!form.testCaseId) {
      toast.warn("Testcase ID is required.");
      return;
    }
    if (!form.uploaded_by) {
      toast.warn("Uploaded By is required.");
      return;
    }
    if (!form.comments) {
      toast.warn("Comments are required.");
      return;
    }
    if (!file) {
      toast.warn("Please upload a PCAP file before submitting");
      return;
    }

      const formDataToSend = new FormData();
      formDataToSend.append("testCaseId", form.testCaseId);
      formDataToSend.append("uploaded_by", form.uploaded_by);
      formDataToSend.append("comments", form.comments);
      formDataToSend.append("file", file);

      if(form.timeZone) formDataToSend.append("timeZone", form.timeZone);
      if (form.start_time) formDataToSend.append("start_time", formatDateToString(form.start_time)); 
      if (form.end_time) formDataToSend.append("end_time", formatDateToString(form.end_time));
      if (form.imsi) formDataToSend.append("imsi", form.imsi);
      if (form.msisdn) formDataToSend.append("msisdn", form.msisdn);

      const response = await api.post("/upload_pcap", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update parent states if provided
      if (setFormData) setFormData(response.data);
      if (setTestCaseId) setTestCaseId(form.testCaseId);
      if (setApiCalled) setApiCalled(false);

      toast.success("Upload complete! Click 'Trigger Analysis' to proceed.");
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file. Please try again.");
    }
  };

  const handleFile = (e) => setFile(e.target.files[0]);

  const handleChange = (e) => {
    console.log(form.timeZone);
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect( () => {
    console.log("Selected time zone", selectedZone);
  },[selectedZone])

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile && ( droppedFile.name.endsWith('.pcap') || droppedFile.name.endsWith('.pcapng'))) {
      setFile(droppedFile);
    } else {
      toast.warn("Only .pcap or .pcapng files are allowed");
    }
    e.dataTransfer.clearData();
  };

  const timezoneStyle = {
    control : ( base, state) => (
      {
        ...base,
        minHeight: "32px",            
        height: "32px",
        fontSize: "12px",            
        borderRadius: "4px",         
        borderWidth: "1px",
        borderColor: state.isFocused ? "#1e40af" : "#d1d5db",
        boxShadow: state.isFocused ? "0 0 0 1px rgba(30,64,175,0.12)" : "none",
        padding: 0,
        display: "flex",
        alignItems: "center",
        outline: "none",
      }
    ),

    valueContainer: (base) => (
      {
        ...base,
        padding: "0 8px",
        height: "32px",
        display: "flex",
        alignItems: "center",
      }
    ),

    input: (base) => (
      {
        ...base,
        margin: 0,
        padding: 0,
        color: "#111827",
      }
    ),

    singleValue: (base) => (
      {
        ...base,
        lineHeight: "32px",
        margin: 0,
      }
    ),

    placeholder: (base) => (
      {

        ...base,
        margin: 0,
        lineHeight: "32px",
        color: "#9ca3af",
        fontSize: "12px",
      }
    ),

    dropdownIndicator: (base) => (
      {
        ...base,
        padding: "4px",
        display: "flex",
        alignItems: "center",
      }
    ),

    indicatorSeparator: () => (
      {
        display: "none"
      }
    ),

    option: (base, state) => (
      {
        ...base,
        fontSize: "12px",
        padding: "8px 12px",
        backgroundColor: state.isSelected ? "#1e40af" : state.isFocused ? "#eef2ff" : "white",
        color: state.isSelected ? "white" : "#111827",
        cursor: "pointer"
      }
    ),

    menu: (base) => (
      {
        ...base,
        borderRadius: "6px",
        overflow: "hidden",
        boxShadow: "hidden",
        boxShadow: "0 6px 18px rgba(15,23,42,0.12)",
      }
    ),

    menuPortal: (base) => (
      {
        ...base,
        zIndex: 9999
      }
    )
  };


  return (
    <div className="fixed inset-0 z-50 bg-gray-800/40 flex justify-center items-center p-2">
      <div className="bg-white rounded-md shadow-lg w-[45%] max-w-2xl text-gray-800">

        {/* Header */}
        <div className="flex items-center justify-between bg-blue-800 text-white px-3 py-1.5 rounded-t-md">
          <div className="flex items-center gap-2">
            <img src={UploadImage} alt="upload" className="w-4" />
            <h2 className="font-medium text-sm">Upload PCAP File</h2>
          </div>
          <button
            onClick={onClose}
            className="text-xl leading-none hover:text-gray-300"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Upload Section */}
          {!file ? (
            <label htmlFor="fileupload" className="cursor-pointer block">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-md p-5 text-center transition-all duration-300 ${
                  dragOver
                    ? "border-blue-500 bg-blue-50 scale-[1.01]"
                    : "border-gray-400"
                }`}
              >
                <img src={CloudUpload} alt="upload" className="w-7 mx-auto mb-2" />
                <p className="text-sm font-medium">Drag & drop your PCAP file</p>
                <p className="text-xs text-gray-500">or click to browse</p>
                <div className="mt-1 inline-block bg-blue-800 text-white text-[10px] px-2 py-[4px] rounded">
                  .pcap or .pcapng
                </div>
              </div>

              <input
                type="file"
                id="fileupload"
                onChange={handleFile}
                accept=".pcap,.pcapng"
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between border-2 border-dashed border-green-400 bg-green-50 rounded-md p-2">
              <div className="flex items-center gap-2">
                <div className="bg-green-500 p-1 rounded">
                  <img src={UploadImage} alt="uploaded" className="w-4" />
                </div>
                <div>
                  <p className="text-green-700 text-sm font-semibold truncate max-w-[150px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-500 hover:text-red-500 text-lg"
              >
                &times;
              </button>
            </div>
          )}

          {/* Form Section */}
          <h3 className="text-sm font-semibold text-gray-700">PCAP Information</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-0.5">
                Testcase ID<span className="text-red-600 text-[11px]"> *</span>
              </label>
              <input
                name="testCaseId"
                className="w-full p-1.5 border border-gray-300 rounded text-xs focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800/12"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-0.5">
                Uploaded By<span className="text-red-600 text-[11px]"> *</span>
              </label>
              <input
                name="uploaded_by"
                className="w-full p-1.5 border border-gray-300 rounded text-xs focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800/12"
                onChange={handleChange}
              />

            </div>

            {/* Optional MSISDN */}
            <div>
              <label className="block text-xs text-gray-600 mb-0.5">
                MSISDN <span className="text-gray-400 text-[11px]">(optional)</span>
              </label>
              <input
                name="msisdn"
                type="text"
                className="w-full p-1.5 border border-gray-300 rounded text-xs focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800/12"
                onChange={handleChange}
              />
            </div>

            {/* Optional IMSI */}
            <div>
              <label className="block text-xs text-gray-600 mb-0.5">
                IMSI <span className="text-gray-400 text-[11px]">(optional)</span>
              </label>
              <input
                name="imsi"
                type="text"
                className="w-full p-1.5 border border-gray-300 rounded text-xs focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800/12"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-0.5">
                Timezone <span className="text-gray-400 text-[11px]">(optional)</span>
              </label>

              <Select
                className="w-full"
                classNamePrefix="react-select"
                options={timeZones.map((tz) => ({ label: tz, value: tz }))}
                value={selectedZone ? { label: selectedZone, value: selectedZone } : null}
                onChange={(selectedOption) => {
                  
                  const fakeEvent = { target: { name: "timezone", value: selectedOption?.value || "" } };

                  handleChange(fakeEvent);
                  setSelectedZone(selectedOption?.value || "");
                }}
                placeholder="Select Time Zone"
                isSearchable={true}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPosition="fixed"
                styles={timezoneStyle}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-0.5">
                Comments <span className="text-red-600 text-[11px]"> *</span>
              </label>
              <textarea
                name="comments"
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded text-xs h-[32px] focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800/12"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-0.5">
                Start Date & Time <span className="text-gray-400 text-[11px]">(optional)</span>
              </label>
              <input
                type="datetime-local"
                name="start_time"
                step={1}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded text-xs focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800/12"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-0.5">
                End Date & Time <span className="text-gray-400 text-[11px]">(optional)</span>
              </label>
              <input
                type="datetime-local"
                name="end_time"
                step={1}
                onChange={handleChange}
                className="w-full p-1.5 border border-gray-300 rounded text-xs focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800/12"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="px-2.5 hover:cursor-pointer py-1 border border-gray-300 rounded text-xs hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              className="px-2.5 py-1 bg-blue-800 text-white rounded text-xs hover:cursor-pointer hover:bg-blue-900 transition"
              onClick={handleUpload}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;