import React from 'react';
import { SendHorizontal ,User} from 'lucide-react';
import Navbar from './Navbar';

const GiveSlotDashboard = () => {
  // Sample data - replace with real data
  const SlotID = window.location.href.split("/").at(-2);
  const [searchbar,setsearchbar] = React.useState("");

  const users = [
    {
      id:"23DE",
      name: "John Doe",
      contact:"John.Doe@gmail.com"
    },
    {
      id:"12SQ",
      name: "Jane Smith",
      contact:"Jane.Smith@gmail.com"
    }
  ];

  function sendRequest(event){
    const sendTo = event.target.classList[0];
    //send LOGIC
  }

  return (<>
    <Navbar isLogged={true} showInfo={true} needsSearch={true} searchbar={searchbar} setsearchbar={setsearchbar}/>
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Header */}
      {/* Main Content */}
      <div className="border rounded-lg">
        <h2 className="p-4 text-xl font-semibold border-b">
          Requests Received
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Contact Details</th>
                <th className="p-4 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {users.filter((a)=>{return searchbar==""||a.name.toLowerCase().includes(searchbar.toLowerCase())||a.contact.toLowerCase().includes(searchbar.toLowerCase())}).map((person, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4">{person.name}</td>
                  <td className="p-4">{person.contact}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={sendRequest}
                        className={person.id+" p-2 rounded hover:bg-blue-200"}
                        aria-label="Send">
                          <SendHorizontal className="w-5 h-5 text-blue-400"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default GiveSlotDashboard;
