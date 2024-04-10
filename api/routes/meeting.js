var express = require("express");
var router = express.Router();
const GoogleService = require('../google-service');
let allTranscripts = [];
async function setupGoogleService() {
    try {
        const googleService = new GoogleService();
        const authClient = await googleService.authorize();

         console.log('running setup google service');
        return {googleService, authClient}
    }
    catch (e) {
        console.log(e)
    }
}

router.get("/", function (req, res, next) {
    res.send("API is working properly");
});

router.get("/notes", async function (req, res, next) {
    const { googleService, authClient } = await setupGoogleService()
     const conferenceRecords = await googleService.getAllListConferenceRecords(authClient)
    //const response2 = googleService.listConferenceRecords(authClient);
    allTranscripts = [];
    for (const record of conferenceRecords) {
        const parent = record.name;
        const transcripts = await googleService.getAllTranscriptsForConf(authClient, parent);
         const transcriptNames = transcripts.map(transcript => transcript.name);
        // allTranscripts.push({ meetingName: record, transcriptNames });
        const transcriptEntries = [];
        for (const entry of transcriptNames){
            const entries =await googleService.callListTranscriptEntries(authClient, entry);
            console.log(entries);
            transcriptEntries.push(...entries.map(entry => ({
                participant: entry.participantDisplayName,
                text: entry.text,
                startTime: entry.startTime.seconds, // Accessing seconds value
                endTime: entry.endTime.seconds, // Accessing seconds value
                languageCode: entry.languageCode // Language code can be directly accessed
                
            })));
            
        }
        allTranscripts.push({
            meeting: {
                name: record.name,
                startTime: record.startTime.seconds, // Accessing seconds value
                endTime: record.endTime.seconds, // Accessing seconds value
                expireTime: record.expireTime.seconds, // Accessing seconds value
                space: record.space
            },
            transcriptEntries: transcriptEntries
    });
    }

    res.send(allTranscripts)
});

module.exports = router;