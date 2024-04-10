import React from "react";
import '../../App.css';
import '../MeetingCard.css';
import MeetingCard from "../MeetingCard";

export default function Meetings() {
   return (
      <div className="meetings">
            <div className="meetings-container">
                <MeetingCard
                    image="./images/meet1.jpeg" 
                    meetingName="Capstone Initation" 
                    link="/meetingsdetails" 
                />
                <MeetingCard
                    image="./images/meet2.jpeg" 
                    meetingName="Github setup" 
                    link="/meetingsdetails" 
                />
                <MeetingCard
                    image="./images/meet3.jpeg" 
                    meetingName="Firebase" 
                    link="/meetingsdetails" 
                />
                <MeetingCard
                    image="./images/meet4.jpeg" 
                    meetingName="Security" 
                    link="/meetingsdetails" 
                />
                <MeetingCard
                    image="./images/meet5.jpeg" 
                    meetingName="Marketing" 
                    link="/meetingsdetails" 
                />
                <MeetingCard
                    image="./images/meet6.jpeg" 
                    meetingName="Database" 
                    link="/meetingsdetails" 
                />
            </div>
      </div>
   );
}
