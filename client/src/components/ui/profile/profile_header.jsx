import React, { useState } from 'react';
import { Mail, Phone, Trophy,Check,CreditCard, } from 'lucide-react';
import usePost from '../../usePost';

export default function ProfileHeader({ name, email, phone: initialPhone, points,credits, cms, rank, avatarUrl }) {
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phone, setPhone] = useState(initialPhone);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handlePhoneClick = () => {
    setIsEditingPhone(true);
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
  };

  const handlePhoneBlur = async () => {
    setIsEditingPhone(false);
    fetch(BACKEND_URL+"/api/update-mobile-number", {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({"mobile_number":phone}),
      withCredentials: true,
      credentials: "include"
    })
    .then(res => {
        if (!res.ok) {
            throw Error('Could not post data to the resource');
        }
        return res.json();
    })
  };

  return (
    <div className="relative mb-8">
      {/* Cover Image */}
      <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg" />
      
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 relative">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{email}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                {!isEditingPhone ? (
                  <button onClick={handlePhoneClick}>{phone}</button>
                ) : (
                  <div className='flex gap-2'>
                    <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="border-b border-gray-300 focus:border-blue-500 outline-none"
                    autoFocus
                    />
                    <button onClick={handlePhoneBlur}><Check className='w-5 h-5'/></button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center gap-1">
                <CreditCard className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">{credits}</span>
              </div>
              <div className="text-sm text-gray-600">Credits</div>
            </div>
            <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-yellow-300">{cms}</div>
              <div className="text-sm text-gray-600">CM Points</div>
            </div>
            <div className="text-center px-4 py-2 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center gap-1">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">{rank}</span>
              </div>
              <div className="text-sm text-gray-600">Rank</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}