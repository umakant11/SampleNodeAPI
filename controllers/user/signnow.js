const path = require('path');

const fs = require('fs');

const api = require('@signnow/api-client')({
    credentials: 'ENCODED_CLIENT_CREDENTIALS',
    production: false, // if false uses eval server
});

const signnow = require('@signnow/api-client')({
  credentials: 'BASE64_ENCODED_CLIENT_CREDENTIALS',
  production: false, // if false then uses eval server
});

//const access_token = env('SIGN_NOW_API_ACCESS_TOKEN');

const access_token = "XXX";




exports.getSignNowUserInformation = async (req, res, next) => {
    try {
        api.user.retrieve({
            token: access_token,
          }, (err, data1) => {
            if(err){
                console.log("In error");
                return res.status(200).json({ success: true, message: "No record found", data: null });
            }
            return res.status(404).json({ success: false, message: "User get successfully", data: data1 });
          });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, message: "Unable to create document, Please try again!", data: null });
    }
};

exports.uploadDocument = async (req, res, next) => {

    const file = req.file;
    const filename = (file.filename);
    //console.log(path.join(__dirname,'../../','public', "dummy.pdf"));
    //return res.status(400).json({ success: false, message: "document created successfully!", data: null });

    const fieldInvite = {
        from: 'umakant@digialpha.co',
        to: [
          {
            email: req.body.email,
            role: 'Signer 1',
            order: 1,
            reassign: '0',
            decline_by_signature: '0',
            reminder: 4,
            expiration_days: 10,
            subject: 'Sign your document',
            message: 'Sign your document',
          },
        ],
    };

    const fields = {
       client_timestamp: 1527859375,
        fields: [
          {
            page_number: 0,
            type: 'signature',
            name: 'Signature',
            role: 'Signer 1',
            required: true,
            height: 30,
            width: 70,
            x: 50,
            y: 100,
          }
        ],
    };
    
    // const fields = {
    //        client_timestamp: 1527859375,
    //         fields: [
    //           {
    //             page_number: 0,
    //             type: 'signature',
    //             name: 'Signature',
    //             role: 'Signer 1',
    //             required: true,
    //             height: 30,
    //             width: 70,
    //             x: 50,
    //             y: 100,
    //           }
    //         ],
    //         fields: [
    //             {
    //               page_number: 0,
    //               type: 'signature',
    //               name: 'Signature',
    //               role: 'Signer 1',
    //               required: true,
    //               height: 30,
    //               width: 70,
    //               x: 100,
    //               y: 100,
    //             }
    //           ]
    //     };
        
      
    try {
        api.document.create({
            token: access_token,
            filepath: path.join(__dirname,'../../','public', filename),
        }, async (err, res1) => {
            if(err){
                console.log(err);
                return res.status(400).json({ success: false, message: "Unable to upload document, Please try again!", data: null });
            }
            await api.document.update({
                token: access_token,
                id: res1.id,
                fields,
            }, async (err2, res2) => {
                if(err2){
                    console.log("document update error");
                }
                await api.document.invite({
                    data: {
                        ...fieldInvite,
                    },
                    id: res2.id,
                    token: access_token,
                  }, (err, res3) => {
                    if(err){
                        return res.status(400).json({ success: false, message: "Unable to send invite, Please try again!", data: err });
                    }
                    console.log("send invite success");
                });
                //return res.status(200).json({ success: true, message: "Send invite successfully!"});
            });
            return res.status(200).json({ success: true, message: "upload document successfully!", data: res1 });
        });
    } catch (err) {
        console.log("error");
        return res.status(400).json({ success: false, message: "Unable to create document, Please try again!", data: null });
    }
    
};

exports.createInviteToSignDocument = async (req, res, next) => {
    const fieldInvite = {
        from: 'umakant@digialpha.co',
        to: [
          {
            email: 'umakantsutar11@gmail.com',
            role: 'Signer 1',
            order: 1,
            reassign: '0',
            decline_by_signature: '0',
            reminder: 4,
            expiration_days: 10,
            subject: 'Sign your document',
            message: 'Sign your document',
          },
        ],
      };
      
      api.document.invite({
        data: {
            ...fieldInvite,
        },
        id: 'e7d5ad011a384278921bd1969576f6abfd0949bd',
        //id:'94e9057563664327a6a481e12759aeba80350edb',
        token: access_token,
      }, (err, res1) => {
        if(err){
            console.log(err);
            //console.log(err);
            return res.status(400).json({ success: false, message: "Unable to send invite, Please try again!", data: err });
        }
        console.log("success");
        
      });
      return res.status(200).json({ success: false, message: "Send invite successfully!", data: null });
};

exports.documentView = async (req, res, next) => {
  api.document.view({
    token: access_token,
    id: 'document id',
  }, (err, res) => {
    // handle error or process response data
  });
};

exports.documentList = async (req, res, next) => {
    api.document.list({
        token: 'your auth token',
    }, (err, res) => {
        // handle error or process response data
    });
};

exports.getWebhooks = async(req, res, next) => {
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

exports.createWebhook = async(req, res, next) => {
    api.webhook.create({
        token: access_token,
        event: 'document.create',
        callback_url: 'http://6d80-2401-4900-1b89-896a-59e7-122d-6fd8-877b.ngrok.io/api/signnow/webhook',
      }, (err, res1) => {
        if(err){
            console.log("Create webhook error");
            return res.status(200).json({ success: false, message: "Unable to create webhook!", data: null });
        }
        console.log("Webhook Success");
        return res.status(200).json({ success: true, message: "Webhook created successfully!", data: null });
      });
}

exports.postWebhookCallback = async(req, res, next) => {
    console.log("In post webhook");
    //console.log(res);
    return res.status(200).json();
}


exports.createWebhookDocumentComplete = async(req, res, next) => {
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
    console.log(res);
    console.log(JSON(res));
    return res.status(200).json();
}

