const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const documentSchema = new Schema({
    email : {
        type: String
    },
    document_id:{
        type: String,
        required:true
    },
    invite_id:{
        type: String,
    },
    status:{
        type:String
    },
    url:{
        type:String
    }
});

module.exports=mongoose.model('Document', documentSchema);