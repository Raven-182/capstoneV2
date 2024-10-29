import React from 'react';
import { Link } from 'react-router-dom';

function MeetingCard(props) {
    // const formattedDate = new Date(props.meetingTimestamp).toLocaleDateString(undefined, {
    //     year: 'numeric',
    //     month: 'long',  
    //     day: 'numeric'  
    // });
    console.log("Meetings found for meeting cards:", props.meetingDetails )
    console.log("Link to be navigated:", {
        pathname: `/meetingsdetails/${props.meetingId}`,
        state: { meeting: props.meetingDetails } // Pass meeting details as state
    });
    
    return (
        <div className="meeting-card">
            <img src={props.image} className="meeting-card-image" />
            <div className="meeting-card-content">
                <h2 className="meeting-card-name">{props.meetingDetails.meetingTopic}</h2>
                <Link 
                    to={{
                        pathname: `/meetingsdetails/${props.meetingId}`,
                         // Pass meeting details as state
                    }} 
                    state = {props.meetingDetails} className="meeting-card-link">View Meeting</Link>
            </div>
        </div>
    );
}

export default MeetingCard;
