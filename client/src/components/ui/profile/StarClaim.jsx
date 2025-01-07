import React from 'react'
import { Star } from 'lucide-react'
import { useDispatch } from 'react-redux';

export default function ExtraCreditBox(props) {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  function handleReward(event){
    event.preventDefault();
    fetch(BACKEND_URL+"/api/avail-credits", {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      withCredentials: true,
      credentials: "include"
    })
    .then(res => {
        if (!res.ok) {
            throw Error('Could not post data to the resource');
        }
        return res.json();
    })
    window.location.reload();
  }

  
  return (
    <>
    {props.reward?<div>
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 p-1 rounded-lg shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 opacity-30 animate-shimmer"></div>
        <div className="flex flex-col gap-2 relative bg-white p-6 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold text-purple-600">Bonus Offer</div>
            <Star className="text-yellow-400 h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Claim 1 WM Credit for 50 WM points</h2>
          <button
            className="text-center w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            aria-label="Claim extra credit" onClick={(e)=>{handleReward(e)}}>
            Claim Now
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>:null}
    </>
  )
}