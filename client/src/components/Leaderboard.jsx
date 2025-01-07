import { Trophy, Medal, Crown, ChevronUp } from 'lucide-react';
import React,{ useState, useEffect } from 'react';
import Navbar from './Navbar';
import Loader from "./Loader";
import Footer from './Footer';

const LeaderboardsPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [data, setData] = useState(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/users`, {
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

  const users = data.users;
  const user = data.user;


  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-blue-500 opacity-50" />;
    }
  };


  return (
    <>
        <Navbar isLogged={true} showInfo={true}/>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto p-4 pt-8">
            <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Height Leaderboard</h1>
            <p className="text-gray-600">See how you measure up against others</p>
            </div>

            <div className="space-y-3">
            {users.sort((a,b)=>b.cms-a.cms).map((item, index) => (
                <div
                key={index}
                className={`transform transition-all duration-200 hover:scale-[1.01] ${
                    item.isCurrentUser
                    ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-500 ring-opacity-50'
                    : 'bg-white shadow hover:shadow-md'
                } rounded-xl p-4`}
                id={item.isCurrentUser?"current-user":"user"+index}
                >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-opacity-10 bg-blue-100">
                        {getRankIcon(item.index+1)}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                        <span className="font-semibold">
                            {item.isCurrentUser ? 'You' : item.name}
                        </span>
                        {item.rank <= 3 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                            Top {index+1}
                            </span>
                        )}
                        </div>
                        <div className="text-sm opacity-75">
                          {item.index+1==1?"Master Collaborator":item.index+1==2?"Competitive Collaborator":item.index+1==3?"Complan Planner":null}
                        </div>
                    </div>
                    </div>
                    <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold">{item.cms}cm</div>
                    <div className="text-sm opacity-75">#{index+1}</div>
                    </div>
                </div>
                </div>
            ))}
            </div>

            {currentUserRank >= 9 && scrollPosition < 500 && (
            <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto">
                <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <ChevronUp className="animate-bounce" />
                    <div>
                    <div className="font-medium">Your Position</div>
                    <div className="text-sm opacity-75">
                        Rank #{currentUserRank} • {leaderboard.find(item => item.isCurrentUser)?.cms}cm
                    </div>
                    </div>
                </div>
                <button 
                    //onClick={() => window.scrollTo({ id:"current-user", behavior: 'smooth' })}
                    onClick={()=>{window.scrollTo()}}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                    Your Rank
                </button>
                </div>
            </div>
            )}
        </div>
        </div>
        <Footer/>
    </>
  );
};

export default LeaderboardsPage;