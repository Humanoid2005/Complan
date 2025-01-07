import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Loader from "./Loader";
import Footer from './Footer';
import { use } from 'react';

function WMSlots(){
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [slotStatusFilter, setSlotStatusFilter] = useState('Available');
  const [bookingConfirmationModal, setBookingConfirmationModal] = useState(false);
  const [deductedSlots, setDeductedSlots] = useState(new Set());
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [searchbar, setsearchbar] = useState("");
  const [deletemode,setdeletemode] = useState("NO");

  const today = new Date();
  const newtoday = new Date();
  newtoday.setHours(0,0,0,0);
  const UTCtoday = new Date(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate(),today.getUTCHours(),today.getUTCMinutes());

  const dates = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => new Date(year, month, i + 1));

  const [data, setData] = useState(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/wmslots`, {
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

  function deductPoints(id){
    setdeletemode(id);
  }

  useEffect(()=>{
    async function deductPoints(id){
      if(id!="NO"){
        try {
          const response = await fetch(`${BACKEND_URL}/api/wmslots/deduct-points/${id}`, {
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
        } catch (err) {
          console.log(err);
        }
      }
    };
    deductPoints(deletemode);
    setdeletemode("NO");
  },[deletemode]);
  


  if(pending){
    return <Loader message={"Loading Washing Machine Slots..."}/>;
  }

  if(error){
    return <Loader message={error}/>;
  }

  const wmslots = data.wmslots;
  const user = data.user;

  const parsedwmslots2 = wmslots?wmslots.map((wmslot)=>{
    const parsedstarttime = new Date(wmslot.start_time);
    const parsedendtime = new Date(wmslot.end_time);
    return {...wmslot,
    start_time:parsedstarttime,
    end_time:parsedendtime
  };}):null;

  const parsedwmslots = wmslots?wmslots.map((wmslot)=>{
    const parsedstarttime = new Date(wmslot.start_time);
    const parsedendtime = new Date(wmslot.end_time);
    return {...wmslot,
    start_time:new Date(parsedstarttime.getUTCFullYear(),parsedstarttime.getUTCMonth(),parsedstarttime.getUTCDate(),parsedstarttime.getUTCHours(),parsedstarttime.getUTCMinutes()),
    end_time:new Date(parsedendtime.getUTCFullYear(),parsedendtime.getUTCMonth(),parsedendtime.getUTCDate(),parsedendtime.getUTCHours(),parsedendtime.getUTCMinutes())
  };}):null

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

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleBookingCancel = () => {
    setBookingConfirmationModal(false);
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handlePreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleAskSlot = async (event,wmid,wmemail) => {
    event.preventDefault();
    try {
      const now = new Date();
      const response = await fetch(`${BACKEND_URL}/api/wmslots/ask`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: now.getFullYear(),
          month: now.getMonth(),
          day: now.getDate(),
          hour:now.getHours(),
          minute:now.getMinutes(),
          id:wmid,
          email:wmemail
        }),
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Request not sent");
      }

      const result = await response.json();
      if (result.status) {
        navigate("/wm_slots");
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
    <div className="flex flex-col h-screen">
      <Navbar isLogged={true} showInfo={true} needsSearch={true} searchbar={searchbar} setsearchbar={setsearchbar}/>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col w-1/3 p-4 bg-gray-100">
          <h2 className="text-lg font-bold mb-4">Calendar</h2>
          <div className="flex mb-4">
            <button className="bg-black text-white text-sm rounded mr-3 p-2" onClick={handlePreviousMonth}>Previous</button>
            <p>{new Date(year, month).toLocaleString('default', { month: 'long' })} {year}</p>
            <button className="bg-black text-white text-sm rounded ml-3 pr-3 text-center" onClick={handleNextMonth}>Next</button>
          </div>
          <div className="flex flex-wrap">
            {dates.map((date, i) => (
              <button
                key={i}
                className={`w-8 h-8 text-center ${
                  selectedDate.getDate() === date.getDate() && 
                  selectedDate.getMonth() === date.getMonth() && 
                  selectedDate.getFullYear() === date.getFullYear() 
                    ? 'bg-blue-500 text-white' 
                    : date < newtoday 
                    ? 'bg-gray-400' 
                    : 'bg-gray-200'
                }`}
                onClick={() => handleDateChange(date)}
                disabled={date < newtoday}
              >
                {date.getDate()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex justify-between">
              <h2 className="text-lg font-bold mb-4">Time Slots</h2>
              <h2>{selectedDate.toDateString()}</h2>
          </div>

          <div className="flex flex-wrap gap-2 overflow-scroll rounded">
              <Link to="/wm_book"
                className={`w-full p-2 text-center bg-blue-500 flex justify-center text-white rounded`}
              >
                <b>Book a Washing Machine Slot</b>
              </Link>
            {parsedwmslots2!=null&&parsedwmslots2
              .sort((a,b) => a.start_time - b.start_time)
              .filter((a) => 
                (searchbar === "" || 
                a.user.toLowerCase().includes(searchbar.toLowerCase()) || 
                a.start_time.toISOString().includes(searchbar.toLowerCase()) || 
                a.end_time.toISOString().includes(searchbar.toLowerCase()))
              )
              .filter((ts) => 
                ts.start_time.getDate() === selectedDate.getDate() && 
                ts.start_time.getMonth() === selectedDate.getMonth() && 
                ts.start_time.getFullYear() === selectedDate.getFullYear()
              )
              .map((timeSlot, i) => {
                if(!deductedSlots.has(timeSlot.id) && timeSlot.deducted==false && isAfter(today,timeSlot.end_time) && timeSlot.added_time==""){
                  deductPoints(timeSlot.id);
                  setDeductedSlots((prev) => new Set(prev).add(timeSlot.id));
                }
              return(
              <Link
                to={user.email==timeSlot.user?"/wm_slot/"+timeSlot.id:"#"}
                key={i}
                className={`w-full p-2 text-center ${
                  timeSlot.added_time != '' && isAfter(today,timeSlot.start_time) && isAfter(timeSlot.end_time,today) ? 'bg-green-500' : 
                  timeSlot.added_time == '' && isAfter(today,timeSlot.start_time) && isAfter(timeSlot.end_time,today) ? 'bg-red-500'  : 
                  timeSlot.added_time != '' && isAfter(today,timeSlot.end_time) ? 'bg-green-200' :
                  timeSlot.added_time == '' && isAfter(today,timeSlot.end_time) ? 'bg-red-800' :
                  'bg-gray-200'
                }`}
              >
                <p>Slot Date: {timeSlot.start_time.getDate()}-{timeSlot.start_time.getMonth()+1}-{timeSlot.start_time.getFullYear()}</p>
                <p>Slot Time: {timeSlot.start_time.getHours()}:{timeSlot.start_time.getMinutes()>10?timeSlot.start_time.getMinutes():"0"+timeSlot.start_time.getMinutes()} - {timeSlot.end_time.getHours()}:{timeSlot.end_time.getMinutes()>10?timeSlot.end_time.getMinutes():"0"+timeSlot.end_time.getMinutes()}</p>
                <p>Name: {timeSlot.user}</p>
                {user.email!=timeSlot.user&&!(isAfter(today,timeSlot.end_time) || (isAfter(today,timeSlot.start_time) && isAfter(timeSlot.end_time,today)))&&<button 
                onClick={(e)=>{handleAskSlot(e,timeSlot.id,timeSlot.user)}}
                className={`bg-green-500 hover:bg-green-700 text-white px-4 py-1 rounded-md`}
                disabled={isAfter(today,timeSlot.end_time) || (isAfter(today,timeSlot.start_time) && isAfter(timeSlot.end_time,today))}
                >
                Ask Slot
                </button>}
              </Link>
            );})}
          </div>
        </div>
      </div>
      <div className="flex justify-between p-4 bg-gray-100">
        <div className="flex items-center">
          <span className="w-4 h-4 bg-gray-200 inline-block mr-2"></span>
          <p>Upcoming</p>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 bg-red-500 inline-block mr-2"></span>
          <p>Delayed</p>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 bg-green-500 inline-block mr-2"></span>
          <p>Ongoing</p>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 bg-green-200 inline-block mr-2"></span>
          <p>Completed</p>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 bg-red-900 inline-block mr-2" ></span>
          <p>Expired</p>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default WMSlots;