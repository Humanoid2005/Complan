import React from 'react';
import { BarChart3, Clock, Award,WashingMachine,LucideShirt} from 'lucide-react';


export default function StatsSection({ WMpoints, WMnumber,VPnumber ,tags }) {
  const stats = [
    {
      label: 'WM Points',
      value: WMpoints,
      icon: WashingMachine,
      color: 'text-blue-500',
    },
    {
      label: 'Completed Washes',
      value: WMnumber,
      icon: LucideShirt,
      color: 'text-green-500',
    },
    {
      label: 'Joined Polls',
      value: VPnumber,
      icon: BarChart3,
      color: 'text-purple-500',
    },
    {
      label: 'Tags',
      value: tags,
      icon: Award,
      color: 'text-yellow-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}