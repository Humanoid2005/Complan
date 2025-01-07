import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Loader from "./Loader";
import Footer from './Footer';

function VPSlots(){
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [slotStatusFilter, setSlotStatusFilter] = useState('Available');
  const [bookingConfirmationModal, setBookingConfirmationModal] = useState(false);
  const [deductedSlots, setDeductedSlots] = useState(new Set());
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [searchbar, setsearchbar] = useState("");

  const today = new Date();
  const newtoday = new Date();
  newtoday.setHours(0,0,0,0);
  const UTCtoday = new Date(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate(),today.getUTCHours(),today.getUTCMinutes());

  const dates = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => new Date(year, month, i + 1));

  //const {data,pending,error} = useFetch(BACKEND_URL+"/api/wmslots");

  const [data, setData] = useState(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/vpslots`, {
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


  if(pending){
    return <Loader message={"Loading Washing Machine Slots..."}/>;
  }

  if(error){
    return <Loader message={error}/>;
  }

  const vpslots = data.vpslots;
  const user = data.user;

  const parsedvpslots2 = vpslots?vpslots.map((vpslot)=>{
    const parsedstarttime = new Date(vpslot.time);
    return {...vpslot,
    time:parsedstarttime,
  };}):null

  const parsedvpslots = vpslots?vpslots.map((vpslot)=>{
    const parsedstarttime = new Date(vpslot.time);
    return {...vpslot,
    time:new Date(parsedstarttime.getUTCFullYear(),parsedstarttime.getUTCMonth(),parsedstarttime.getUTCDate(),parsedstarttime.getUTCHours(),parsedstarttime.getUTCMinutes()),
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
              <h2 className="text-lg font-bold mb-4">Pooling groups</h2>
              <h2>{selectedDate.toDateString()}</h2>
          </div>

          <div className="flex flex-wrap gap-2 overflow-scroll rounded">
              <Link to="/vp_create"
                className={`w-full p-2 text-center bg-blue-500 flex justify-center text-white rounded`}
              >
                <b>Create A Vehicle Pooling group</b>
              </Link>
            {parsedvpslots2!=null&&parsedvpslots2
              .sort((a,b) => a.time - b.time)
              .filter((a) => {
                return ((searchbar==""||a.from_location.toLowerCase().includes(searchbar.toLowerCase())||a.to_location.toLowerCase().includes(searchbar.toLowerCase())||a.time.toISOString().includes(searchbar)||(a.owner.name.toLowerCase().includes(searchbar.toLowerCase()))||(a.owner.contact.toLowerCase().includes(searchbar.toLowerCase()))||(a.members.some(member=>member.name.toLowerCase().includes(searchbar.toLowerCase())||member.contact.toLowerCase().includes(searchbar.toLowerCase())))));
              }
              )
              .filter((ts) => 
                ts.time.getDate() === selectedDate.getDate() && 
                ts.time.getMonth() === selectedDate.getMonth() && 
                ts.time.getFullYear() === selectedDate.getFullYear()
              )
              .map((timeSlot, i) => {
              return(
              <Link
                to={"/vp_group/"+timeSlot.id}
                key={i}
                className={`w-full p-2 text-center ${
                  'bg-gray-200'
                }`}
              >
                <p>Date of Departure: {timeSlot.time.getDate()}-{timeSlot.time.getMonth()+1}-{timeSlot.time.getFullYear()}</p>
                <p>Time of departure: {timeSlot.time.getHours()}:{timeSlot.time.getMinutes()}</p>
                <p>From: {timeSlot.from_location}</p>
                <p>To: {timeSlot.to_location}</p>
              </Link>
            );})}
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default VPSlots;