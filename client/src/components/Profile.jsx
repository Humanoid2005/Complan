import React from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

import ActivitySection from './ui/profile/profile_activity';
import StatsSection from './ui/profile/profile_stats';
import ProfileHeader from './ui/profile/profile_header';
import useFetch from './useFetch';
import Navbar from "./Navbar";
import Loader from "./Loader";

export default function Profile() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const {data:user,pending:loading,error} = useFetch(BACKEND_URL+"/api/current_user");

  if(loading==true){
    return <Loader message={"Loading profile..."}/>
  }

  if(error){
    return <Loader message={error}/>;
  }

  return (
    <>
      <Navbar showInfo={true}/>
      <div className="min-h-screen bg-gray-50 pb-12">
        <ProfileHeader
          name={user.name}
          email={user.email}
          phone={user.mobile_number}
          credits={user.credits}
          points={user.points}
          cms = {user.cms}
          rank={user.rank}
          avatarUrl={user.picture}
        />

        <div className="container max-w-4xl mx-auto px-4">
          <StatsSection
            WMpoints={user.points}
            WMnumber={user.WMnumber}
            VPnumber={user.VPnumber}
            tags={user.tags}
          />

          <ActivitySection tags={user.tags} reward={user.points>=50}/>
        </div>
      </div>
    </>
  );
}