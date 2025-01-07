import React from 'react'
import { Star,Tag } from 'lucide-react'

export default function TagsBox(props) {
  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 p-1 rounded-lg shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 opacity-30 animate-shimmer"></div>
        <div className="h-full relative bg-white p-6 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Your Tags</h2>
            <Tag className="text-blue-400 h-8 w-8" />
          </div>
          <div className="flex flex-wrap gap-2">
            {props.tags.map((tag, index) => (
              <span 
                key={index}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-300 transition duration-300 ease-in-out cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
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
    </div>
  )
}