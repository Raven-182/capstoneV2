import React, { useState } from 'react';
import './MeetingSummary.css';

function MeetingSummary({ meeting }) {
  console.log("received meeting in meeting summary", meeting);
  const [activeTab, setActiveTab] = useState('keyDecisions'); // Default active tab

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Helper function to sanitize text
  const sanitizeText = (text) => {
    // Remove leading dash and "meeting summary:" prefix if present
    return text.replace(/^-+\s*/, '').replace(/^meeting summary:\s*/i, '');
  };

  return (
    <div className="meeting-summary">
      <h4>Meeting Summary</h4>
      <div className="tab-buttons">
        <button
          className={activeTab === 'keyDecisions' ? 'active' : ''}
          onClick={() => handleTabChange('keyDecisions')}
        >
          Key Decisions
        </button>
        <button
          className={activeTab === 'agenda' ? 'active' : ''}
          onClick={() => handleTabChange('agenda')}
        >
          Agenda Items
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
        {/* Key Decisions Tab */}
        {activeTab === 'keyDecisions' && (
          <div className="tab active">
            <strong>Key Decisions</strong><br /><br />
            <ul>
              {meeting.keyDecisions.map((decision, i) => (
                <li key={i}>{sanitizeText(decision)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Agenda Items Tab */}
        {activeTab === 'agenda' && (
          <div className="tab active">
            <strong>Agenda Items</strong><br /><br />
            <ul>
              {meeting.workItems.map((item, i) => (
                <li key={i}>{sanitizeText(item)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Meeting Notes Tab */}
        {activeTab === 'meetingNotes' && (
          <div className="tab active">
            <strong>Meeting Notes</strong><br /><br />
            <ul>
              {meeting.meetingMinutes.map((note, i) => (
                <li key={i}>{sanitizeText(note)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Meeting Details Tab */}
        {activeTab === 'details' && (
          <div className="tab active">
            <strong>Meeting Details</strong><br /><br />
            <ul>
              <li><strong>Email:</strong> {meeting.email || 'Not found'}</li>
              <li><strong>Title:</strong> {meeting.meetingTopic || 'Not found'}</li>
              <li><strong>Date:</strong> {formatDate(meeting.timestamp)}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default MeetingSummary;
