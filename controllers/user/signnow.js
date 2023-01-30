const Document = require('../../models/document');
const path = require('path');

const fs = require('fs');
const download = require('download');
const { DownloaderHelper } = require('node-downloader-helper');

require('dotenv').config();
const config = process.env;

const Joi = require('joi');

const api = require('@signnow/api-client')({
    credentials: 'ENCODED_CLIENT_CREDENTIALS',
    production: false, // if false uses eval server
});

const signnow = require('@signnow/api-client')({
  credentials: 'BASE64_ENCODED_CLIENT_CREDENTIALS',
  production: false, // if false then uses eval server
});

const access_token = config.SIGN_NOW_API_ACCESS_TOKEN;


exports.uploadDocument = async (req, res, next) => {
  
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            "any.required": "Email is required",
            "string.email": "Email is invalid"
        }),
    });

    const validationResult = schema.validate(req.body);
    
    if (validationResult.error) {
      return res.status(422).json(validationResult.error);
    }

    const file = req.file;
    const filename = (file.filename);
    const fromEmail = config.SIGN_NOW_FROM_EMAIL;
    const fieldInvite = {
        from: fromEmail,
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
    //console.log(req.body.content);

    if(req.body.meta && req.body.meta.event == "invite.update"){
        const email = req.body.content.signer;
        const document_id = req.body.content.document_id;
        const invite_id = req.body.content.invite_id ? req.body.content.invite_id : null;
        const status = req.body.content.status;
        let download_url = null;
        console.log(document_id);
        if(status === "fulfilled"){
          console.log("In update document");
          // Get document url for download document
          api.document.share({
            token: access_token,
            id: document_id
          }, (err, res2) => {
              if(err){
                console.log(err);
              }else{
                console.log(res2.link);
                const dl = new DownloaderHelper(res2.link, path.join(__dirname,'../../','public/signed_document'));
                // download signed pdf using url
                dl.on('end', async(data) => {
                    console.log('Download Completed');
                    download_url = data.fileName;
                    //Update status and url of document
                    await Document.update({ document_id },{
                      $set :{
                        "status" : status,
                        "url": download_url
                      }
                    }
                  );
                });
                dl.on('error', (err) => console.log('Download Failed', err));
                dl.start().catch(err => console.error(err));
              }
            }
          );
        }else{
          console.log("In save document");
          const payload = new Document({
            email: email,
            document_id: document_id,
            invite_id: invite_id,
            status: status,
            url: null
          });
          const document = await payload.save();
        }
    }
    return res.status(200).json();
}

exports.documentDownload = async(req, res, next) => {
  console.log(req.params.documentId);  
  api.document.share({
    token: access_token,
    id: req.params.documentId
  }, (err, res2) => {
      if(err){
        console.log(err);
        return res.status(200).json({ success: false});
      }else{
        console.log(res2.link);
        const dl = new DownloaderHelper(res2.link, path.join(__dirname,'../../','public/signed_document'));
        dl.on('end', () => console.log('Download Completed'));
        dl.on('error', (err) => console.log('Download Failed', err));
        dl.start().catch(err => console.error(err));
        return res.status(200).json({ success: true});
      }
    }
  );
    /*
    api.document.download({
      token: access_token,
      id: req.params.documentId,
      options: { 
        withAttachments: true, // false by default
        withHistory: true, // false by default
      },
    }, (err, res1) => {
      if(err){
        console.log(err);
        return res.status(200).json({ success: false});
      }else{
        //console.log(res1);
        //return res1;
        //console.log(res1.toString());
        //fs.writeAllBytes("filename.pdf", res1);
        //var buffer = Buffer.from(res1, 'base64');
        
        // let buff = Buffer.from(res1,'binary').toString('base64');

        // let originalname = Buffer.from(buff,'base64');

        //console.log(originalname.toString());
        //let base64data = buff.toString('base64');
        
        
        
        // let filename = '125.pdf';
        // let filepath = path.join(__dirname,'../../','public', filename);
        // fs.writeFile(filepath, res1, 'binary', function(err){
        //   if(err){
        //     console.log("Error");
        //   }else{
        //     console.log("Success");
        //   }
          
        // });

        
        return res.status(200).json({ success: true});
      }
    });
    */
    
}

