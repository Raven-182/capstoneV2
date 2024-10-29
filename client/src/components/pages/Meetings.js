import React, { useState, useEffect } from "react";
import '../../App.css';
import '../MeetingCard.css';
import MeetingCard from "../MeetingCard";
import { getAuth } from "firebase/auth";  // Firebase authentication
import { useNavigate } from "react-router-dom"; 
export default function Meetings() {
  const [meetings, setMeetings] = useState([]);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null); // State for error message
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Fetch meetings when the component mounts
    const fetchMeetings = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          navigate('/'); // Redirect to home if not authenticated
          console.log("In route /notes : not authenticated");
          return;
        }

        const userId = user.uid; 
        console.log("In meetings, logged in user", userId);

        const response = await Promise.race([
          fetch(`http://localhost:9000/api/meeting/${userId}/processed/`),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout: API not responding")), 5000)) // Timeout after 5 seconds
        ]);

        if (!response.ok) {
          throw new Error("Failed to fetch meetings");
        }

        const data = await response.json();  
        setMeetings(Object.entries(data));
        
      } catch (error) {
        console.error("Error fetching meetings:", error);
        setError(error.message); // Set error message
      } finally {
        setLoading(false);  // Set loading to false after the fetch is complete
      }
    };

    fetchMeetings();
  }, []);  // Empty dependency array means this effect runs once after the component mounts

  if (loading) {
    return <p>Loading meetings...</p>;  // Display a loading message while fetching
  }

  if (error) {
    return (
      //TODO: remove inline css
      <div className="error-message" style={{ textAlign: 'center', margin: '20px', color: 'red' }}>
        <h1>{error}</h1> 
      </div>
    );
  }

  return (
    <div className="meetings">
      <div className="meetings-container">
        {meetings.map(([meetingId, meetingDetails]) => (
          
          <MeetingCard
            key={meetingId} 
            meetingId={meetingId} 
            image="./images/meet1.jpeg"  
            meetingName="Capstone Catchup" 
            link={'/meetingsdetails'}  
            meetingTimestamp={meetingDetails.timestamp}  
            meetingDetails={meetingDetails} 
          />
        ))}
      </div>
    </div>
  );
}
