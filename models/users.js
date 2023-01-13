const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname : {
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required:true
    },
    email:{
        type: String,
    },
    password:{
        type:String
    }
});

module.exports=mongoose.model('User', userSchema);