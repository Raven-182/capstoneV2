export const msalConfig = {
    auth: {
      clientId: 'a9d2ad92-8d83-492d-868d-8a8e13dc4e65',  
      authority: 'https://login.microsoftonline.com/common',  
      redirectUri: 'http://localhost:3000',  
    },
    cache: {
      cacheLocation: 'localStorage',  
      storeAuthStateInCookie: false,  
    },
  };
  //MSAL configuration object
  export const loginRequest = {
    scopes: ['User.Read', 'Calendars.Read']  
  };
  //Login request object

export const googleConfig = {
  clientId: '539229757933-cmup66kc92mdkadenmgpglepsfk1i45o.apps.googleusercontent.com',  // Replace with the client ID from your Google Cloud project
  discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],  // Google Calendar API docs
  scope: "https://www.googleapis.com/auth/calendar.readonly", 
};
