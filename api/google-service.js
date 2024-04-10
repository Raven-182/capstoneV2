const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { SpacesServiceClient } = require('@google-apps/meet').v2;
const { ConferenceRecordsServiceClient } = require('@google-apps/meet').v2;
const { auth } = require('google-auth-library');
const axios = require('axios');
const SCOPES = ['https://www.googleapis.com/auth/meetings.space.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

class GoogleService {
  constructor() {

  }

  async loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return auth.fromJSON(credentials);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  /**
   * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
   *
   * @param {OAuth2Client} client
   * @return {Promise<void>}
   */
  async saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
  }

  /**
   * Load or request or authorization to call APIs.
   *
   */
  async authorize() {
    let client = await this.loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await this.saveCredentials(client);
    }
    return client;
  }

  async getAllListConferenceRecords(authClient) {
    const meetClient = new ConferenceRecordsServiceClient({
      authClient: authClient
    });

    // Construct request
    const request = {

    };

    // Run request
    const iterable = meetClient.listConferenceRecordsAsync(request);
    var allResponses = []
    for await (const response of iterable) {
      //console.log(response);
      allResponses.push(response);
    }
    return allResponses
  }

  async getAllTranscriptsForConf(authClient, parent) {
    const meetClient = new ConferenceRecordsServiceClient({
      authClient: authClient
    });

    // Construct request
    const request = {
      parent,
    };

    // Run request
    const iterable = meetClient.listTranscriptsAsync(request);
    var allResponses = []
    for await (const response of iterable) {

      //console.log(response);
      allResponses.push(response);
    }
    return allResponses
  }


  /**
   * list transcripts
   */
  async callListTranscriptEntries(authClient, parent) {
    const meetClient = new ConferenceRecordsServiceClient({
      authClient: authClient
    });
    // Construct request
    const request = {
      parent,
    };

    // Run request
    const iterable = meetClient.listTranscriptEntriesAsync(request);
    var allResponses = []
    for await (const response of iterable) {
      console.log(response);
      // Construct request
      const name = response.participant
      const request = {
        name,
      };

      // Run request
      let displayName = "Not Signed In";
      const participantResponseArray = await meetClient.getParticipant(request);
      if (participantResponseArray && participantResponseArray[0]) {
        const participantResponse = participantResponseArray[0];
        displayName = participantResponse.signedinUser.displayName;

      }
      //const displayName = participant.signedinUser.displayName;
      allResponses.push({
        ...response,
        participantDisplayName: displayName,
    });
    }
    return allResponses;
  }


  /**
   * participant info
   */


  async callGetParticipant(authClient, name) {
    const meetClient = new ConferenceRecordsServiceClient({
      authClient: authClient
    });
    // Construct request
    const request = {
      name,
    };

    // Run request
    const response = await meetClient.getParticipant(request);
    console.log(response);
  }
  /**
   * 
   * Get info about the space
   */


  async callGetSpace(authClient) {
    const name = 'aeq-zeqo-wht';
    const meetClient = new SpacesServiceClient({
      authClient: authClient
    });
    console.log('in getspace');

    // Construct request
    const request = {
      name,
    };

    // Run request
    const response = await meetClient.getSpace(request);
    console.log(response);

  }

  /**
   * Creates a new meeting space.
   * @param {OAuth2Client} authClient An authorized OAuth2 client.
   */
  async createSpace(authClient) {
    const meetClient = new SpacesServiceClient({
      authClient: authClient
    });
    // Construct request
    const request = {
    };

    // Run request
    const response = await meetClient.createSpace(request);
    console.log(`Meet URL: ${response[0].meetingUri}`);
    console.log('running');
  }

  // authorize().then(createSpace).catch(console.error);
}

module.exports = GoogleService;