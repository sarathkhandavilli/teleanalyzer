import { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar.jsx';
import CallFailureDetection from './pages/CallFailureDetection.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { ToastContainer } from 'react-toastify';

function App() {
  const [selectedItem, setSelectedItem] = useState('cf');

  const [callFailureData, setCallFailureData] = useState([]);
  const [formData, setFormData] = useState(null);
  const [apiCalled, setApiCalled] = useState(false);
  const [testCaseId, setTestCaseId] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Persist data across component mounts
  const [allData, setAllData] = useState([]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar selectedItem={selectedItem} setItem={setSelectedItem} />
      <div className="flex-1 overflow-y-auto">
        {selectedItem === "cf" && (
          <CallFailureDetection
            callFailureData={callFailureData}
            setCallFailureData={setCallFailureData}
            formData={formData}
            setFormData={setFormData}
            apiCalled={apiCalled}
            setApiCalled={setApiCalled}
            testCaseId={testCaseId}
            setTestCaseId={setTestCaseId}
            expandedIndex={expandedIndex}
            setExpandedIndex={setExpandedIndex}
            allData={allData}
            setAllData={setAllData}
          />
        )}
        {selectedItem === "db" && <Dashboard allData={allData} setAllData={setAllData} />}
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;