import CallFail from '../assets/callfailwhite.png';
import DashboardWhite from '../assets/dashboard_white.png';

const sidebarItems = [
  { key: 'cf', name: 'Call Failure Detection  AI', icon: CallFail },
  { key: 'db', name: 'Dashboard', icon: DashboardWhite },
];

export const columns = {testcase_id:'TestCaseId',created_at: 'Timestamp', uploaded_by:'Uploaded By', 
  comments:'Comments', call_status:'Call Status'} 
export default sidebarItems;
