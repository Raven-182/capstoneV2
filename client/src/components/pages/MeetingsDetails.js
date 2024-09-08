import React, { useState } from "react";
import '../../App.css';
import '../WorkItem.css';
import '../MeetingsDetails.css';
import WorkItemList from "../WorkItemList";
import MeetingSummary from "../MeetingSummary";
import Transcript from "../Transcript";

export default function MeetingDetails(){
    const [workItems, setWorkItems] = useState([
      'Prepare presentation slides',
      'Review project timeline',
      'Discuss budget allocations',
      'Coordinate with team members',
      'Research market trends',
      'Prepare agenda for weekly meeting',
    ]);

    const meeting = {
      title: 'Weekly Meeting',
      date: '2024-04-01',
      time: '10:00 AM - 12:00 PM',
      duration: '2 hours',
      location: 'Conference Room A',
      attendees: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Johnson'],
      agendaItems: [
        'Discuss project updates', 
        'Review action items', 
        'Review financial report'
      ],
      decisions: [
        'Approved project proposal',
        'Scheduled next project milestone'
      ],
      actionItems: [
        'John to finalize budget report', 
        'Jane to update project timeline', 
        'Bob to prepare marketing presentation'
      ],
      nextSteps: [
        "Schedule next meeting for next week.", 
        'Assign tasks for next sprint'
      ],
      attachments: [
        "www.google.com", 
        "www.twitter.com", 
        'www.facebook.com'
      ],
      notes: [
        "Good progress made during the meeting.",
        'Discussion on new project scope.'
      ]
    };

    return (
        <div className="meetings-details">
            <WorkItemList workItems={workItems} />
            <MeetingSummary meeting={meeting} />
            <Transcript />
        </div>
     );
}
