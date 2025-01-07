import React from 'react';
import { Loader2 } from 'lucide-react';
import Navbar from "./Navbar";

// Spinner Component
const LoadingSpinner = () => {
  return (
    <div className="relative">
      <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-pulse"></div>
    </div>
  );
};

function App(props) {
  return (
    <>
      <Navbar/>
      <style>
        {`
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 75%; }
            95% { width: 95%; }
            100% { width: 95%; }
          }

          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-progress {
            animation: progress 3s ease-in-out infinite;
          }
          
          .animate-fade-in {
            animation: fade-in 1s ease-out forwards;
          }
        `}
      </style>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
            Let us collaborate and plan together...
          </h1>
          
          <div className="relative">
            <LoadingSpinner />
          </div>
          
          <div className="max-w-md mx-auto space-y-4">
            <p className="text-gray-600 text-lg animate-fade-in">
              {props.message}
            </p>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 w-3/4 animate-progress"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;