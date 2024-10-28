import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import '../../App.css';
import '../Calendar.css';
import Modal from 'react-modal';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest, googleConfig } from '../../authConfig';  
import { Client } from '@microsoft/microsoft-graph-client';  
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrosoft } from '@fortawesome/free-brands-svg-icons';
import { gapi } from 'gapi-script'; // Import Google API
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

const msalInstance = new PublicClientApplication(msalConfig);

export default function Calendars() {
  const [date, setDate] = useState(new Date());
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDetails, setEventDetails] = useState('');
  const [events, setEvents] = useState([]);  
  const [startTime, setStartTime] = useState(''); 
  const [endTime, setEndTime] = useState('');     
  const [outlookEvents, setOutlookEvents] = useState([]);  
  const [googleEvents, setGoogleEvents] = useState([]); // Google events state
  const [account, setAccount] = useState(null);  
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false); // Google sign-in status
  const [selectedEvent, setSelectedEvent] = useState(null);  // Store the clicked event's details
  const [isViewingEvent, setIsViewingEvent] = useState(false);  // Track if viewing an event or creating one

  // Custom modal styles
  // Custom modal styles with dark overlay
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginTop:'50px',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '80%',
    maxWidth: '500px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darken background with opacity
  },
};

  // Sign in to Outlook
  const signIn = async () => {
    try {
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      setAccount(loginResponse.account);
      fetchOutlookEvents(loginResponse.account);
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  // Fetch events from Outlook
  const fetchOutlookEvents = async (account) => {
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account,
      });
  
      const accessToken = tokenResponse.accessToken;
  
      const client = Client.init({
        authProvider: (done) => {
          done(null, accessToken);  
        },
      });
  
      const eventsResponse = await client.api('/me/events').select('subject,start,end').get();
      const fetchedEvents = eventsResponse.value.map(event => ({
        title: event.subject,
        start: new Date(event.start.dateTime),  
        end: new Date(event.end.dateTime),
        details: "Imported from Outlook",
      }));
  
      setOutlookEvents(fetchedEvents);  
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Initialize Google API
  useEffect(() => {
    function start() {
      gapi.client.init({
        apiKey: googleConfig.apiKey,
        clientId: googleConfig.clientId,
        discoveryDocs: googleConfig.discoveryDocs,
        scope: googleConfig.scope,
      }).then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        console.log("Google API initialized, signed in:", authInstance.isSignedIn.get());
        setIsGoogleSignedIn(authInstance.isSignedIn.get());
  
        authInstance.isSignedIn.listen(signedIn => {
          console.log("Google Sign-In Status Changed:", signedIn);
          setIsGoogleSignedIn(signedIn);
        });
      }).catch(error => {
        console.error("Error initializing Google API:", error);
      });
    }
  
    gapi.load('client:auth2', start);
  }, []);
  

  // Google Sign-In
  const handleGoogleSignIn = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  // Google Sign-Out
  const handleGoogleSignOut = () => {
    gapi.auth2.getAuthInstance().signOut();
  };

  // Fetch Google Calendar Events
 const fetchGoogleEvents = async () => {
  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: 'startTime',
    });

    const fetchedGoogleEvents = response.result.items.map(event => ({
      id: event.id,
      title: event.summary,
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.start.date),
      details: "Imported from Google Calendar",
    }));

    setGoogleEvents(fetchedGoogleEvents);
  } catch (error) {
    console.error('Error fetching Google events:', error);
  }
};


  // Function to handle date clicks and open the modal
  const handleDateClick = (selectedDate) => {
    const eventOnDate = checkForEvent(selectedDate);  // Check if there's an event on the clicked date

    if (eventOnDate) {
      setSelectedEvent(eventOnDate);  // Set the clicked event's details
      setIsViewingEvent(true);  // Set modal to view event details
    } else {
      setDate(selectedDate);
      setSelectedEvent(null);  // No event to view
      setIsViewingEvent(false);  // Set modal to create a new event
    }

    setModalIsOpen(true);  // Open the modal
  };

  // Function to handle creating events
const handleCreateEvent = () => {
  // Clone the selected date to create separate start and end Date objects
  const eventStart = new Date(date);
  const eventEnd = new Date(date);

  // Split the time strings into hours and minutes, then set them on the Date objects
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  // Set the hours and minutes for the start and end time
  eventStart.setHours(startHour, startMinute);
  eventEnd.setHours(endHour, endMinute);

  const newEvent = {
    title: eventTitle,
    details: eventDetails,
    start: eventStart, // Store full start datetime
    end: eventEnd,     // Store full end datetime
  };

  setEvents([...events, newEvent]);

  // Reset modal and inputs after creating the event
  setModalIsOpen(false);
  setEventTitle('');
  setEventDetails('');
  setStartTime('');
  setEndTime('');
};

  

  // Check if a date has an event from local, Outlook, or Google
  const checkForEvent = (date) => {
    const localEvent = events.find((event) => new Date(event.start).toDateString() === date.toDateString());
    const outlookEvent = outlookEvents.find((event) => new Date(event.start).toDateString() === date.toDateString());
    const googleEvent = googleEvents.find((event) => new Date(event.start).toDateString() === date.toDateString());
    return localEvent || outlookEvent || googleEvent;
  };

  useEffect(() => {
    if (account) {
      fetchOutlookEvents(account);
    }
  }, [account]);

  useEffect(() => {
    if (isGoogleSignedIn) {
      fetchGoogleEvents();
    }
  }, [isGoogleSignedIn]);

  return (
    <div className="calendars">
      
      {/* Button Container for proper alignment */}
      <div className="button-container">
      <button class="outlook_loginbutton" onClick={signIn}>
    <FontAwesomeIcon icon={faMicrosoft} style={{ marginRight: '8px' }} />
    Sign in to Outlook
  </button>
  {!isGoogleSignedIn ? (
    <button class="google_loginbutton" onClick={handleGoogleSignIn}>
      <FontAwesomeIcon icon={faGoogle} style={{ marginRight: '8px' }} />
      Sign in to Google
    </button>
  ) : (
    <button class="google_loginbutton" onClick={handleGoogleSignOut}>
      <FontAwesomeIcon icon={faGoogle} style={{ marginRight: '8px' }} />
      Sign out of Google
    </button>
  )}
      </div>
  
      {/* Calendar container */}
      <div className="calendar-container">
        <Calendar
          onChange={setDate}
          value={date}
          onClickDay={handleDateClick}
          tileContent={({ date, view }) => {
            const event = checkForEvent(date);
            return event ? (
              <div className="event-indicator">
                📅 {event.title}
              </div>
            ) : null;
          }}
          showNavigation={true}
          showNeighboringMonth={true}
        />
      </div>
  
      {/* Modal for event creation or viewing event */}
      <Modal
  isOpen={modalIsOpen}
  onRequestClose={() => setModalIsOpen(false)}
  style={customStyles}
  contentLabel={isViewingEvent ? "View Event" : "Create Event"}
>
  {isViewingEvent && selectedEvent ? (
    <div>
      <h2>Event Details</h2>
      <p><strong>Title:</strong> {selectedEvent.title}</p>
      <p><strong>Date:</strong> {new Date(selectedEvent.start).toLocaleDateString()}</p>
      <p><strong>Start Time:</strong> {new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      <p><strong>End Time:</strong> {new Date(selectedEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      <p><strong>Details:</strong> {selectedEvent.details || "No details provided"}</p>
      <button onClick={() => setModalIsOpen(false)}>Close</button>
    </div>
  ) : (
    <div className="create-event-form">

      {/* Event Title */}
      <div className="form-group">
        <label>Event Title:</label>
        <input
          class="event-modal-input"
          type="text"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder="Enter event title"
        />
      </div>

      {/* Event Details */}
      <div className="form-group">
        <label>Event Details:</label>
        <textarea
          class="event-modal-input"
          value={eventDetails}
          onChange={(e) => setEventDetails(e.target.value)}
          placeholder="Enter event details"
        />
      </div>

      {/* Event Start Time */}
      <div className="form-group">
        <label>Start Time:</label>
        <input
          class="event-modal-input"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      {/* Event End Time */}
      <div className="form-group">
        <label>End Time:</label>
        <input
          class="event-modal-input"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      {/* Buttons */}
      <div className="form-buttons">
        <button onClick={handleCreateEvent}>Create Event</button>
        <button onClick={() => setModalIsOpen(false)}>Cancel</button>
      </div>
    </div>
  )}
</Modal>


    </div>
  );
  
}
