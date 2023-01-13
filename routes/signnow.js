const express = require('express');

const router = express.Router();

const signNowController = require('../controllers/user/signnow');

console.log("In Sign now router");

router.get('/user-sign-now', signNowController.getSignNowUserInformation);

router.post('/invite', signNowController.createInviteToSignDocument);

router.post('/document', signNowController.uploadDocument);

router.post('/create-webhook', signNowController.createWebhook);

router.post('/webhook-document-complete', signNowController.createWebhookDocumentComplete);

router.post('/webhook', signNowController.postWebhookCallback);

router.post('/document-complete', signNowController.postDocumentComplete);

router.get('/webhook-list', signNowController.getWebhooks);

module.exports = router;