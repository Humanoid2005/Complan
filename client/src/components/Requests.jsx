import { useState, useEffect } from 'react';
import { Check, X, Clock, CheckCircle,CircleX } from 'lucide-react';
import Navbar from './Navbar';
import Loader from "./Loader";
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Utility Functions
const filterRequests = (requests, searchTerm, isSent = false) => {
  return requests.filter(req => {
    const searchFields = isSent 
      ? [req.request_to, req.type] 
      : [req.request_from, req.type];
    return searchTerm === "" || searchFields.some(field => 
      field.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const formatDateTime = (date1) => {
  const date = new Date(date1);
  return `${date.getDate()}-${date.getMonth()+2}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
};

// Modal Component
function SlotDetailsModal({ isOpen, onClose, slotDetails }) {
  if (!isOpen || !slotDetails) return null;
  console.log(slotDetails);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Slot Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {slotDetails.wmslot.id.charAt(0)=="W"?<div className="grid grid-cols-2 gap-20">
            <div>
              <p className="text-sm text-gray-600">Slot Owner</p>
              <p className="font-medium">{slotDetails.wmslot.user}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Start Time</p>
              <p className="font-medium">{formatDateTime(slotDetails.wmslot.start_time)}</p>
            </div>
          </div>:
          <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Start Time</p>
            <p className="font-medium">{formatDateTime(slotDetails.vpslot.start_time)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">From</p>
            <p className="font-medium">{slotDetails.vpslot.from_location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">To</p>
            <p className="font-medium">{slotDetails.vpslot.to_location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Members</p>
            <p className="font-medium">{slotDetails.vpslot.to_location}</p>
          </div>
          <div className="overflow-x-auto my-2">
                <table className="w-full">
                    <thead>
                    <tr className="border-b bg-gray-50">
                        <th className="p-4 text-left">Name</th>
                        <th className="p-4 text-left">Contact Information</th>
                        <th className="p-4 text-center"></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr key={index} className="border-b">
                        <td className="p-4">{slotDetails.vpslot.owner.name}</td>
                        <td className="p-4">{slotDetails.vpslot.owner.contact}</td>
                        <td className="p-4">
                        Leader
                        </td>
                    </tr>
                    {slotDetails.vpslot.members.map((member, index) => (
                        <tr key={index} className="border-b">
                        <td className="p-4">{member.name}</td>
                        <td className="p-4">{member.contact}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>}
        </div>
      </div>
    </div>
  );
}



// Table Component
function RequestsTable({ activeTab, requests, searchbar }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSlotDetailsClick = async (request) => {
    setIsModalOpen(true);
    const id = request.slotid;
    console.log(id);
    const url = id.charAt(0)=="W"?`${BACKEND_URL}/api/wmslots/${id}`:`${BACKEND_URL}/api/vpslots/${id}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Unable to fetch data");
      }

      const result = await response.json();
      setData(result);
      setPending(false);
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  };

  const respondRequest = async (event,request,accepted) => {

    event.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/requests/respond`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id:request.id,
          accepted:accepted
        }),
        credentials: "include"
      });
  
      if (!response.ok) {
        throw new Error("Request not sent");
      }
  
      const result = await response.json();
      console.log(result);
      if (result.status) {
        window.location.reload();
      }
      else{
          toast.error(result.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 text-left">Time</th>
                <th className="p-4 text-left">Request</th>
                <th className="p-4 text-left">{activeTab === 'received' ? 'From' : 'To'}</th>
                <th className="p-4 text-center">Slot Details</th>
                <th className="p-4 text-center">
                  {activeTab === 'received' ? 'Actions' : 'Status'}
                </th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'received' && requests!=null ? (
                filterRequests(requests, searchbar).map((request, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4">{formatDateTime(request.time_of_request)}</td>
                    <td className="p-4">{request.type}</td>
                    <td className="p-4">{request.request_from}</td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleSlotDetailsClick(request)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      {request.responded==false?<div className="flex justify-center gap-2">
                        <button 
                          className="p-2 rounded hover:bg-green-50 transition-colors"
                          aria-label="Approve"
                          onClick={(e)=>{respondRequest(e,request,true)}}
                        >
                          <Check className="w-5 h-5 text-green-600" />
                        </button>
                        <button 
                          className="p-2 rounded hover:bg-red-50 transition-colors"
                          aria-label="Reject"
                          onClick={(e)=>{respondRequest(e,request,false)}}
                        >
                          <X className="w-5 h-5 text-red-600" />
                        </button>
                      </div>: request.accepted ?<span className="flex items-center text-green-600">
                            <CheckCircle className="w-5 h-5 mr-1" />
                            Approved
                      </span>:<span className="flex items-center text-red-600">
                            <CircleX className="w-5 h-5 mr-1" />
                            Rejected
                      </span>}
                    </td>
                  </tr>
                ))
              ) : requests!=null ?(
                filterRequests(requests, searchbar, true).map((request, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4">{formatDateTime(request.time_of_request)}</td>
                    <td className="p-4">{request.type}</td>
                    <td className="p-4">{request.request_to}</td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleSlotDetailsClick(request)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        {request.responded ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="w-5 h-5 mr-1" />
                            {request.accepted ? 'Approved' : 'Rejected'}
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-600">
                            <Clock className="w-5 h-5 mr-1" />
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ):null}
            </tbody>
          </table>
        </div>
      </div>
      <SlotDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slotDetails={data}
      />
    </>
  );
}

// Main App Component
function App() {
  const [data, setData] = useState(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('received');
  const [searchbar, setSearchbar] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/currentuser/requests`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Unable to fetch data");
        }

        const result = await response.json();
        setData(result);
        setPending(false);
      } catch (err) {
        setError(err.message);
        setPending(false);
      }
    };

    fetchData();
  }, [BACKEND_URL]);

  if (pending) {
    return <Loader message="Loading Washing Machine Slots..." />;
  }

  if (error) {
    return <Loader message={error} />;
  }

  const requests = activeTab === 'received' ? data.received : data.sent;

  return (
    <>
      <Navbar 
        isLogged={true} 
        showInfo={true} 
        needsSearch={true} 
        searchbar={searchbar} 
        setsearchbar={setSearchbar} 
      />
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
          <div className="flex space-x-4 border-b">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'received'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('received')}
            >
              Received Requests
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'sent'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('sent')}
            >
              Sent Requests
            </button>
          </div>

          <RequestsTable
            activeTab={activeTab}
            requests={requests}
            searchbar={searchbar}
          />
        </div>
      </div>
      <Toaster/>
    </>
  );
}

export default App;