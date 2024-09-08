import React, { useState } from 'react';
import './MeetingSummary.css';

function MeetingSummary({ meeting }) {
  const [activeTab, setActiveTab] = useState('agenda'); // Default active tab

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const formatLink = (link) => {
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      return `https://${link}`;
    }
    return link;
  };

  return (
    <div className="meeting-summary">
      <h4>Meeting Summary</h4>
      <div className="tab-buttons">
        <button
          className={activeTab === 'agenda' ? 'active' : ''}
          onClick={() => handleTabChange('agenda')}
        >
          Agenda Items
        </button>
        <button
          className={activeTab === 'decisions' ? 'active' : ''}
          onClick={() => handleTabChange('decisions')}
        >
          Decisions Made
        </button>
        <button
          className={activeTab === 'actions' ? 'active' : ''}
          onClick={() => handleTabChange('actions')}
        >
          Action Items
        </button>
        <button
          className={activeTab === 'attendees' ? 'active' : ''}
          onClick={() => handleTabChange('attendees')}
        >
          Attendees
        </button>
        <button
          className={activeTab === 'nextSteps' ? 'active' : ''}
          onClick={() => handleTabChange('nextSteps')}
        >
          Next Steps
        </button>
        <button
          className={activeTab === 'attachments' ? 'active' : ''}
          onClick={() => handleTabChange('attachments')}
        >
          Attachments
        </button>
        <button
          className={activeTab === 'meetingNotes' ? 'active' : ''}
          onClick={() => handleTabChange('meetingNotes')}
        >
          Meeting Notes
        </button>
        <button
          className={activeTab === 'details' ? 'active' : ''}
          onClick={() => handleTabChange('details')}
        >
          Meeting Details
        </button>
      </div>
      <div className="tab-content">
        <div className={`tab ${activeTab === 'agenda' && 'active'}`}>
          <strong>Agenda Items</strong><br></br><br></br>
          <ul>
            {meeting.agendaItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        <div className={`tab ${activeTab === 'decisions' && 'active'}`}>
          <strong>Decisions Made</strong><br></br><br></br>
          <ul>
            {meeting.decisions.map((decision, i) => (
              <li key={i}>{decision}</li>
            ))}
          </ul>
        </div>
        <div className={`tab ${activeTab === 'actions' && 'active'}`}>
          <strong>Action Items</strong><br></br><br></br>
          <ul>
            {meeting.actionItems.map((actionItem, i) => (
              <li key={i}>{actionItem}</li>
            ))}
          </ul>
        </div>
        <div className={`tab ${activeTab === 'attendees' && 'active'}`}>
          <strong>Attendees</strong><br></br><br></br>
          <ul>
            {meeting.attendees.map((attendee, i) => (
              <li key={i}>{attendee}</li>
            ))}
          </ul>
        </div>
        <div className={`tab ${activeTab === 'nextSteps' && 'active'}`}>
          <strong>Next Steps</strong><br></br><br></br>
          <ul>
            {meeting.nextSteps.map((nextStep, i) => (
              <li key={i}>{nextStep}</li>
            ))}
          </ul>
        </div>
        <div className={`tab ${activeTab === 'attachments' && 'active'}`}>
          <strong>Attachments</strong><br></br><br></br>
          <ul>
            {meeting.attachments.map((attachment, i) => (
              <li key={i}><a href={formatLink(attachment)} target="_blank" rel="noopener noreferrer">{attachment}</a></li>
            ))}
          </ul>
        </div>
        <div className={`tab ${activeTab === 'meetingNotes' && 'active'}`}>
          <strong>Meeting Notes</strong><br></br><br></br>
          <ul>
            {meeting.notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
        <div className={`tab ${activeTab === 'details' && 'active'}`}>
          <strong>Meeting Details</strong><br></br><br></br>
          <ul>
            <li><strong>Title:</strong> {meeting.title}</li>
            <li><strong>Date:</strong> {meeting.date}</li>
            <li><strong>Time:</strong> {meeting.time}</li>
            <li><strong>Duration:</strong> {meeting.duration}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MeetingSummary;
