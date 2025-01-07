import React from "react";
import { Link,useNavigate } from "react-router-dom";
import { Car,Waves,Info } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Home() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search); // Parse the query string
    const token = params.get("token"); // Extract the token
    if (token) {
      localStorage.setItem("accessToken", token); // Save the token to localStorage
      navigate("/"); // Redirect to the home page
    }
  }, [navigate]);


  return (
    <>
    <div>
      <Navbar/>
      <div className="flex justify-center mt-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl ">
            <Link to="/wm_slots">
              <div className="bg-gray-100 group h-64 flex flex-col items-center justify-center p-6 transition-all hover:shadow-lg hover:scale-[1.02]">
                <div className="p-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors mb-4">
                  <Waves className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 text-center">
                  Book a Washing Machine Slot
                </h2>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Reserve your washing machine time slot
                </p>
              </div>
            </Link>

            <Link to="/vp_slots">
              <div className="bg-gray-100 group h-64 flex flex-col items-center justify-center p-6 transition-all hover:shadow-lg hover:scale-[1.02]">
                <div className="p-4 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors mb-4">
                  <Car className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 text-center">
                  Book a Vehicle Pooling Slot
                </h2>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Join or create a vehicle pooling group
                </p>
              </div>
            </Link>
          </div>
      </div>
    </div>
    </>
  );
}