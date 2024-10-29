import React from "react";
import { useLocation } from "react-router-dom";
import '../../App.css';
import '../WorkItem.css';
import '../MeetingsDetails.css';
import MeetingSummary from "../MeetingSummary";
import Transcript from "../Transcript";

export default function MeetingDetails() {
    const location = useLocation(); // Use location hook to access location object
    const meeting = location.state // Get meeting data from state
    console.log("In the meetingsdetail", location.state)
    console.log("Showing the meeting transcripts", meeting.transcript)
    if (!meeting) {
        return <p>No meeting details available.</p>; // Handle case where meeting data is not found
    }

    // Render meeting details
    return (
        <div className="meetings-details">
            <MeetingSummary meeting={meeting} />
           
               {/* TODO: Change to better errir handlingRender Transcript only if meeting.transcript exists */}
              {meeting.transcript ? (
                <Transcript transcript={meeting.transcript} />
            ) : (
                <p>Transcript Not Available.</p> 
            )}
           
        </div>
    );
}
