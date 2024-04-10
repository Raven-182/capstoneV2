import React from 'react';
import { Link } from 'react-router-dom';

function MeetingCard(props) {
    return (
        <div className="meeting-card">
            <img src={props.image} className="meeting-card-image" />
            <div className="meeting-card-content">
                <h2 className="meeting-card-name">{props.meetingName}</h2>
                <Link to={props.link} className="meeting-card-link">View Meeting</Link>
            </div>
        </div>
    );
}

export default MeetingCard;
