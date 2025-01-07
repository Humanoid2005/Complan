import React from 'react';
import { Calendar, Clock, Trophy,Tag } from 'lucide-react';
import StairClaim from "./StarClaim";
import TagsBox from './TagBoxes';

export default function ActivitySection(props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Tags and Achievements</h2>
      <div className="space-y-4 grid grid-cols-2 gap-3">
        <StairClaim reward={props.reward}/>
        <TagsBox tags={props.tags}/>
      </div>
    </div>
  );
}