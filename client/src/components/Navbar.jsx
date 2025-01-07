import React,{useEffect} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { User,MapPin,Trophy,Info,Search,Filter } from "lucide-react";
import Profile_Button from "./Profile_Button";

function SearchBar(props) {
  return (
    <div className="flex gap-4 mb-8 m-8">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Search...."
          className="w-full px-6 py-4 rounded-xl bg-white shadow-md pl-12 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onChange={(e) => props.setsearchbar(e.target.value)}
          value={props.searchbar}
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
    </div>
  );
}


function Navbar(props){
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    
    const authStatus = searchParams.get('auth');
    const userData = searchParams.get('user');

    if (authStatus === 'success' && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }

    checkAuthStatus();
  }, [searchParams, navigate]);


  React.useEffect(() => {
    if (user === null && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(BACKEND_URL+'/api/auth/check', {
        credentials: 'include'
      });
      const data = await response.json();
      console.log(data);
      if (data.authenticated) {
        setUser(data.user);
        return data.authenticated;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    } finally {
      setLoading(false);
      return false;
    }
  };


    
    const logout = async () => {
        try {
          await fetch(BACKEND_URL+'/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
          });
          setUser(null);
          navigate('/', { replace: true });
        } catch (error) {
          console.error('Logout failed:', error);
        }
      };

    return (
        <>
            <nav className="bg-white border-b shadow-sm sticky top-0 z-50 ">
                    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3">
                            <img
                            src="https://github.com/nutlope.png"
                            alt="Logo"
                            className="h-8 w-8 rounded-full"
                            />
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            Complan
                            </span>
                        </Link>
                        </div>
                        <div className="flex items-center space-x-6">
                        <Link to="/rules" className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"><Info className="w-4 h-4 mr-2" aria-hidden="true" />
                        <span>Rules</span>
                        </Link>
                        <Link
                            to="/requests"
                            className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
                        >
                            <MapPin className="w-4 h-4" />
                            <span>Requests</span>
                        </Link>
                        <Link
                            to="/leaderboard"
                            className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
                        >
                            <Trophy className="w-4 h-4" />
                            <span>Leaderboard</span>
                        </Link>
                        {user? (
                            <Profile_Button logout={logout} imgsrc={user.picture}/>
                        ) : (
                            <a href={`${BACKEND_URL}/api/auth/google`}className="bg-black text-white rounded p-2">Login</a>
                        )}
                        </div>
                    </div>
                    </div>
                </nav>
                {props.needsSearch&&
                <SearchBar searchbar={props.searchbar} setsearchbar={props.setsearchbar}/>
                }
        </>
    )
}

export default Navbar;