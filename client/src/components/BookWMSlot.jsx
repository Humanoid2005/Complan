import React from "react";
import Navbar from "./Navbar";
import {useNavigate} from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';

function BookSlot(){
    const BACKEND_URL=import.meta.env.VITE_BACKEND_URL;
    const today = new Date();
    const [date,setdate] = React.useState(new Date());
    const navigate = useNavigate();

    function changeDate(event){
        const inputDate = new Date(event.target.value);
        setdate(inputDate);
    }

    const submitBooking = async (event) => {
      event.preventDefault();
      try {
        const response = await fetch(`${BACKEND_URL}/api/wmslots/add`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            year:date.getFullYear(),
            month:date.getMonth()+1,
            day: date.getDate(),
            hour:date.getHours(),
            minute:date.getMinutes()
          }),
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("Washing Machine Slot creation failed...");
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
            <Navbar isLogged={true} showInfo={true}/>
            <div className="rounded-xl border bg-card text-card-foreground shadow max-w-2xl mx-auto p-8">
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Book Washing Machine Slot
                    </h2>
                    <p className="text-sm text-gray-500">
                        Select your preferred date and time for your washing machine slot
                    </p>
                </div>
                <div className="flex flex-col gap-3 my-3">
                    <input className="appearence-none border rounded shadow py-3 px-2 text-gray-500" type="datetime-local" id="slot-data" name="slot_time" min={today} onChange={changeDate}></input>
                    <button className="p-3 bg-blue-500 rounded text-white" onClick={submitBooking}><b>Book</b></button>
                </div>
            </div>
            <Toaster/>
        </>
    )
}

export default BookSlot;