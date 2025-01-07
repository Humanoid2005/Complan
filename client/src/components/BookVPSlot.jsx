import React from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import { Calendar, MapPin } from "lucide-react";

function BookSlot() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const today = new Date();
  const [date, setdate] = React.useState(new Date());
  const [from, setfrom] = React.useState("");
  const [to, setto] = React.useState("");
  const navigate = useNavigate();

  function changeDate(event) {
    const inputDate = new Date(event.target.value);
    setdate(inputDate);
  }

  const submitBooking = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/vpslots/add`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: date.getFullYear(),
          month: date.getMonth()+1,
          day: date.getDate(),
          hour: date.getHours(),
          minute: date.getMinutes(),
          from_location: from,
          to_location: to
        }),
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Vehicle Pooling Slot creation failed...");
      }

      const result = await response.json();
      if (result.status) {
        navigate("/vp_slots");
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <Navbar isLogged={true} showInfo={true} />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <div className="space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Book Vehicle Pooling Slot
              </h2>
              <p className="text-sm text-gray-500">
                Fill in the details below to create a new pooling group
              </p>
            </div>
            <form className="space-y-6" onSubmit={submitBooking}>
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date and Time
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      className="block w-full pl-10 py-3 pr-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min={today.toISOString()}
                      onChange={changeDate}
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Location
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 py-3 pr-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter pickup location"
                      value={from}
                      onChange={(e) => setfrom(e.target.value)}
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Location
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 py-3 pr-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter drop location"
                      value={to}
                      onChange={(e) => setto(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Book Slot
              </button>
            </form>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}

export default BookSlot;