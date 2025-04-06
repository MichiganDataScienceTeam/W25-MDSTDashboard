import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ExternalLink, Loader, Calendar } from 'lucide-react';

const GoogleCalendarComponent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewType, setViewType] = useState('month'); // month, week, agenda

  const calendarUrl = "https://calendar.google.com/calendar/embed?src=c_22ca0c151585760442cad5796fb91bd18b7db11d813e9143e38549aadce65afe%40group.calendar.google.com&ctz=America%2FDetroit";
  
  // Build the calendar URL with the selected view
  const getCalendarUrlWithView = () => {
    return `${calendarUrl}&mode=${viewType}`;
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="bg-neutral-800 rounded-lg shadow-lg mb-8 overflow-hidden">
      {/* Header with toggle and view options */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-700 to-indigo-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-blue-600 rounded-full p-1"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <h2 className="text-xl font-semibold text-white">MDST Calendar</h2>
        </div>
        
        <div className="flex items-center">
          {/* View selector */}
          <div className="mr-4">
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="agenda">Agenda</option>
            </select>
          </div>
          
          {/* External link */}
          <a 
            href={calendarUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:bg-blue-600 rounded-full p-1"
            title="Open in Google Calendar"
          >
            <ExternalLink size={20} />
          </a>
        </div>
      </div>
      
      {/* Calendar content */}
      {isExpanded && (
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 bg-opacity-70 z-10">
              <div className="flex flex-col items-center">
                <Loader className="animate-spin text-indigo-500 mb-2" size={40} />
                <p className="text-white">Loading calendar...</p>
              </div>
            </div>
          )}
          
          <iframe
            src={getCalendarUrlWithView()}
            title="MDST Google Calendar"
            width="100%"
            height="600"
            frameBorder="0"
            scrolling="no"
            className="bg-white"
            onLoad={handleIframeLoad}
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarComponent;