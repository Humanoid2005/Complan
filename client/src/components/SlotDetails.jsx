import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast,Bounce,ToastContainer } from "react-toastify";
import Navbar from './Navbar';
import Loader from "./Loader";
import Footer from './Footer';

  const isAfter = (d1,d2)=>{
    if(d1.getFullYear()>d2.getFullYear()){
      return true;
    }
    else if(d1.getFullYear()==d2.getFullYear()){
      if(d1.getMonth()>d2.getMonth()){
        return true;
      }
      else if(d1.getMonth()==d2.getMonth()){
        if(d1.getDate()>d2.getDate()){
          return true;
        }
        else if(d1.getDate()==d2.getDate()){
          if(d1.getHours()>d2.getHours()){
            return true;
          }
          else if(d1.getHours()==d2.getHours()){
            if(d1.getMinutes()>d2.getMinutes()){
              return true;
            }
          }
        }
      }
    }
    return false;
  }

const WMSlotDetails = () => {
    const [otp, setOtp] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [data, setData] = useState(null);
    const [pending, setPending] = useState(true);
    const [error, setError] = useState(null);
    const [isSlotAdded, setIsSlotAdded] = useState(false);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/wmslots/${id}`, {
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
    }, [BACKEND_URL, id]);
  
    const handleDeleteSlot = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/wmslots/delete/${id}`, {
          method: "GET",
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Failed to delete slot");
        }
        toast.success('Slot deleted successfully');
        navigate("/wm_slots");
      } catch (err) {
        toast.error(err.message);
      }
    };


    const handleOtpSubmit = async (event) => {
      event.preventDefault();
      try {
        const response = await fetch(`${BACKEND_URL}/api/wmslots/${id}/verify`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ otp }),
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("OTP verification failed");
        }

        const result = await response.json();
        if (result.success) {
          toast.success('OTP Verified Successfully');
          setIsSlotAdded(true);
          window.location.reload();
        }
        else{
            toast.error('Wrong OTP....'); 
        }
      } catch (err) {
        toast.error(err.message);
      }
    };


    if (pending) {
      return <Loader message={"Loading Washing Machine Slots..."} />;
    }

    if (error) {
      return <Loader message={error} />;
    }

    if (data.status === false) {
      toast.error('Not your slot', {
        position: "top-center",
      });
      navigate("/wm_slots");
      return null;
    }

    const wmslot = data.wmslot;
    const user = data.user;
    const slotStartTime = new Date(wmslot.start_time);
    const slotEndTime = new Date(wmslot.end_time);

    const today = new Date();

    return (
      <>
        <Navbar isLogged={true} showInfo={true} />
        <div className="flex flex-col items-center font-sans space-y-6">
          <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 w-80 text-center">
            <h2 className="text-2xl font-bold mb-4">Washing Machine Slot Details</h2>
            
            <div className="flex justify-between mb-2">
              <strong className="text-gray-700">Name:</strong>
              <span>{user.name}</span>
            </div>

            <div className="flex justify-between mb-2">
              <strong className="text-gray-700">Slot Date:</strong>
              <span>{slotStartTime.getDate()+"-"+(slotStartTime.getMonth()+1)+"-"+slotStartTime.getFullYear()}</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <strong className="text-gray-700">Slot Begin Time:</strong>
              <span>{slotStartTime.getHours()}:{slotStartTime.getMinutes()}</span>
            </div>
            
            <div className="flex justify-between mb-4">
              <strong className="text-gray-700">Slot Added Time:</strong>
              <span>{wmslot.added_time==""?"Not Added":new Date(wmslot.added_time).toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between space-x-4 mt-6">
              <button 
                onClick={handleDeleteSlot}
                disabled={slotStartTime.getTime() - today.getTime() <= 2 * 60 * 60 * 1000}
                className={`${(slotStartTime.getTime() - today.getTime() > 2 * 60 * 60 * 1000) ? "bg-red-600 hover:bg-red-800" : "bg-gray-500 hover:bg-gray-700"} text-white px-4 py-2 rounded-md`}
              >
                Delete Slot
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 w-80 text-center">
            <label className="text-lg font-semibold mb-2">OTP: {wmslot.otp}</label>
            <form onSubmit={handleOtpSubmit}>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-2 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter OTP"
              />
              <button 
                type="submit"
                disabled={slotStartTime.getTime() > today.getTime() || today.getTime()>slotEndTime.getTime() || wmslot.added_time!=""}
                className={`mt-4 w-full py-2 rounded-md ${!(slotStartTime.getTime() > today.getTime() || today.getTime()>slotEndTime.getTime() || wmslot.added_time!="") ? "bg-black hover:bg-gray-700" : "bg-gray-700"} text-white`}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
        <Footer/>
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
        />
      </>
    );
};

export default WMSlotDetails;