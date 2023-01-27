const Document = require('../../models/document');
const path = require('path');


const fs = require('fs');
const config = process.env;

const api = require('@signnow/api-client')({
    credentials: 'ENCODED_CLIENT_CREDENTIALS',
    production: false, // if false uses eval server
});

const signnow = require('@signnow/api-client')({
  credentials: 'BASE64_ENCODED_CLIENT_CREDENTIALS',
  production: false, // if false then uses eval server
});

//const access_token = config.SIGN_NOW_API_ACCESS_TOKEN;
const access_token ='35299b2703911c705fc2e23717ed33ba9a97615b8f8d2d931544d35a7d4fae48';




exports.uploadDocument = async (req, res, next) => {

    const file = req.file;
    const filename = (file.filename);
    const fieldInvite = {
        from: 'umakant@digialpha.co',
        to: [
          {
            email: req.body.email,
            role: 'Customer',
            order: 1,
            reassign: '0',
            decline_by_signature: '0',
            reminder: 1,
            expiration_days: 3,
            subject: 'Sign your document',
            message: 'Sign your document',
          },
        ],
    };
   
    console.log("In document upload..");
    try {
        await api.document.fieldextract({
                token: access_token,
                filepath: path.join(__dirname,'../../','public', filename),
            }, async (error, response) => {
                if(error){
                  console.log(error);
                  return res.status(400).json({ success: false, message: "Unable to upload document, Please try again!", data: null });
                }
                console.log("document id.." + response.id);
                await api.document.invite({
                    data: {
                    ...fieldInvite,
                    },
                    id: response.id,
                    token: access_token,
                }, (error2, response2) => {
                    if(error2){
                      return res.status(400).json({ success: false, message: "Unable to send invite, Please try again!", data: err });
                    }
                    return res.status(200).json({ success: true, message: "Sent invite successfully!" });
                });
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, message: "Unable to create document, Please try again!", data: null });
    }
};


exports.getWebhooks = async(req, res, next) => {
    console.log(access_token);
    signnow.webhook.list({
        token: access_token,
    }, (err, result) => {
        if(err){
            console.log("List webhook error");
            return res.status(200).json({ success: false, message: "Webhook list error!", data: err });
        }
        console.log("List Success");
        return res.status(200).json({ success: true, message: "Webhook created successfully!", data: result });
    });
};


exports.createWebhookDocumentComplete = async(req, res, next) => {
    console.log(req.body.url);
    api.webhook.create({
        token: access_token,
        event: 'invite.update',
        callback_url: req.body.url,
      }, (err, res1) => {
        if(err){
            console.log("Create webhook error");
            return res.status(200).json({ success: false, message: "Unable to create webhook!", data: null });
        }
        console.log("Webhook Success");
        return res.status(200).json({ success: true, message: "Webhook created successfully!", data: null });
      });
}


exports.postDocumentComplete = async(req, res, next) => {
    console.log("In document complete after sign");
    console.log(req.body.content);

    if(req.body.meta && req.body.meta.event == "invite.update"){
        const email = req.body.content.signer;
        const document_id = req.body.content.document_id;
        const invite_id = req.body.content.invite_id ? req.body.content.invite_id : null;
        const status = req.body.content.status;

        // console.log(email);
         console.log(document_id);
        // console.log(invite_id);
        // console.log(status);
        if(status === "fulfilled"){
          console.log("In update document");
          await Document.update({ document_id },{
              $set :{
                "status" : status
              }
            }
          );
        }else{
          console.log("In save document");
          const payload = new Document({
            email: email,
            document_id: document_id,
            invite_id: invite_id,
            status: status
          });
          const document = await payload.save();
        }
    }
    
    return res.status(200).json();
}

