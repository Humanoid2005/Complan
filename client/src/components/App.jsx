import React,{ useState,useEffect } from 'react'
import {Routes,Route,Link, BrowserRouter} from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { useLocation } from 'react-router-dom';

import WMSlots from './WMSlots'
import Home from './HomePage';
import RequestsDashboard from './Requests';
import BookSlot from './BookWMSlot';
import WMSlotDetails from './SlotDetails';
import GiveSlotDashboard from './GiveSlot';
import VPSlots from './VPSlots';
import VPGroupDetails from './VPGroupDetails';
import BookGroup from './BookVPSlot';
import Navbar from './Navbar';
import LeaderboardsPage from './Leaderboard';
import Profile from './Profile';
import RulesAndRegulations from './RulesPage';


function App() {


  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/wm_slots" element={<WMSlots/>}></Route>
          <Route path="/wm_book" element={<BookSlot/>}></Route>
          <Route path="/requests" element={<RequestsDashboard/>}></Route>
          <Route path="/wm_slot/:id" element={<WMSlotDetails/>}></Route>
          <Route path="/wm_slot/:id/give_slot" element={<GiveSlotDashboard/>}></Route>
          <Route path="/vp_slots" element={<VPSlots/>}></Route>
          <Route path="/vp_group/:id" element={<VPGroupDetails/>}></Route>
          <Route path="/vp_create" element={<BookGroup/>}></Route>
          <Route path="/leaderboard" element={<LeaderboardsPage/>}></Route>
          <Route path="/profile" element={<Profile/>}></Route>
          <Route path="/rules" element={<RulesAndRegulations/>}></Route>
        </Routes>
      </BrowserRouter>
  )
}

export default App
