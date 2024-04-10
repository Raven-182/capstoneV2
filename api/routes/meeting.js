var express = require("express");
var router = express.Router();
const GoogleService = require('../google-service');

async function setupGoogleService() {
    try {
        const googleService = new GoogleService();
        const authClient = await googleService.authorize();
        //await googleService.createSpace(authClient);
         //googleService.callGetConferenceRecord(authClient);
         console.log('running setup google service');
         //await googleService.callGetSpace(authClient);
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
     const response2 = await googleService.getAllListConferenceRecords(authClient)
    //const response2 = googleService.listConferenceRecords(authClient);
    const parent = "conferenceRecords/2037944c-e45e-4451-97e9-44cf337b6777"
    const response = await googleService.getAllTranscriptsForConf(authClient, parent)
    res.send( response2)
});

module.exports = router;