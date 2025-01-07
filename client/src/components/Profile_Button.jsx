import React from "react";
import { User, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Link,useNavigate } from "react-router-dom";


export default function Profile_Button(props){

    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const navigate = useNavigate();


    return (
        <>
            <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Open user menu">
                <img src={props.imgsrc} className="h-8 w-8 rounded-lg"></img>
            </button>
            {isDropdownOpen&&
                <div className="absolute right-0 mt-40 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <Link
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                    role="menuitem"
                    to="/profile"
                    >
                        <User className="mr-3 h-4 w-4" /> Profile
                    </Link>
                    <button
                    onClick={props.logout}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                    role="menuitem"
                    >
                    <LogOut className="mr-3 h-4 w-4" /> Log out
                    </button>
                </div>
                </div>}
        </>
    );
}