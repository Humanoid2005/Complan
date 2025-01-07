import React, { useState,useEffect } from 'react';
import { BrowserRouter, Link,useParams,useNavigate } from 'react-router-dom';
import {User } from 'lucide-react';
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


const VPGroupDetails = () => {
    const today = new Date();
    const {id} = useParams();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [data, setData] = useState(null);
    const [pending, setPending] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const sendJoinRequest = async (e)=>{
        e.preventDefault();
        try {
          const now = new Date();
          const response = await fetch(`${BACKEND_URL}/api/vpslots/join`, {
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
              id:id,
              contact:vpslot.owner.contact
            }),
            credentials: "include"
          });
    
          if (!response.ok) {
            throw new Error("Request not sent");
          }
    
          const result = await response.json();
          if (result.status) {
            navigate("/vp_slots");
          }
          else{
              toast.error(result.message);
          }
        } catch (err) {
          toast.error(err.message);
        }
    }

    const leaveVPSlot =  async (e)=>{
        try {
            const response = await fetch(`${BACKEND_URL}/api/vpslots/leave/${id}`, {
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
            navigate("/vp_slots")
          } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/vpslots/${id}`, {
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

    if (pending) {
        return <Loader message={"Loading Washing Machine Slots..."} />;
      }
  
    if (error) {
    return <Loader message={error} />;
    }

    const user = data.user;
    const vpslot = data.vpslot;
    const startTime = new Date(vpslot.time);

    const GroupData = {from:"A",to:"B",members:2,start_time:new Date(2024,9,27,7,30)};
    const GroupMembers = [{id:1,name:"John Doe",contact:"John.Doe@gmail.com"},{id:2,name:"Susan Joe",contact:"1234567890"}];

    return (<>
        <Navbar isLogged={true} showInfo={true} />

        <div className="flex justify-around items-center font-sans">
            {/* Slot Details Card */}
            <div className="bg-white border border-gray-300 rounded-lg shadow-md p-6 w-1/2 text-center">
                <h2 className="text-2xl font-bold mb-4">Group Details</h2>
                
                <div className="flex justify-between mb-2">
                    <strong className="text-gray-700">From:</strong>
                    <span>{vpslot.from_location}</span>
                </div>

                <div className="flex justify-between mb-2">
                    <strong className="text-gray-700">To:</strong>
                    <span>{vpslot.to_location}</span>
                </div>

                <div className="flex justify-between mb-2">
                    <strong className="text-gray-700">Departure:</strong>
                    <span>{startTime.getDate()}-{startTime.getMonth()+1}-{startTime.getFullYear()},{startTime.getHours()}:{startTime.getMinutes()}</span>
                </div>                    

                <div className="flex justify-between space-x-4 mt-6">
                    {vpslot.owner.name==user.name || vpslot.members.some(member=>member.name==user.name)?<button onClick={(e)=>{leaveVPSlot(e)}} className={`${isAfter(startTime,today)?"bg-red-600":"bg-gray-500"} ${isAfter(startTime,today)?"hover:bg-red-800":"hover:bg-gray-700"} text-white px-4 py-2 rounded-md`} disabled={isAfter(today,startTime)}>
                        Leave
                    </button>:<button onClick={(e)=>{sendJoinRequest(e)}} className={`${isAfter(startTime,today)?"bg-red-600":"bg-gray-500"} ${isAfter(startTime,today)?"hover:bg-red-800":"hover:bg-gray-700"} text-white px-4 py-2 rounded-md`} disabled={isAfter(today,startTime)}>
                        Join
                    </button>}
                </div>
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
                    <tr className="border-b">
                        <td className="p-4">{vpslot.owner.name}</td>
                        <td className="p-4">{vpslot.owner.contact}</td>
                        <td className="p-4">
                            Leader
                        </td>
                        </tr>
                    {vpslot.members.map((member, index) => {
                        console.log(isAfter(startTime,today));
                        return (
                        <tr key={index} className="border-b">
                        <td className="p-4">{member.name}</td>
                        <td className="p-4">{member.contact}</td>
                        </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
        <Footer/>
        </>
    );
};

export default VPGroupDetails;
