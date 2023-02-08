const { boolean } = require('joi');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const materialSchema = new Schema({
    id : {
        type: String,
        required: true
    },
    projectId:{
        type: String,
        default: null
    },
    customerId:{
        type: String,
        default: null
    },
    sheet:{
        type: String,
        required: true
    },
    room:{
        type: String,
        required: true
    },  
    location:{
        type: String,
        required: true
    },
    model:{
        type: String,
        default: null
    },
    manufacturer:{
        type: String,
        default: null
    },
    color:{
        type: String,
        default: null
    },
    finish:{
        type: String,
        default: null
    },
    size:{
        type: String,
        default: null
    },
    notes:{
        type: String,
        default: null
    },
    sf:{
        type: String,
        default: null
    },
    link:{
        type: String,
        default: null
    },
    tag:{
        type: String,
        default: null
    },
    previousId:{
        type: String,
        default: null
    },
    nextId:{
        type: String,
        default: null
    },
    acceptStatus:{
        type: Boolean,
        default: false
    },
    aprroveStatus:{
        type: Boolean,
        default: false
    },
    isActive:{
        type: Boolean,
        default: true
    },
    sequence:{
        type: Number,
        default: null
    }
},{ timestamps: true });

module.exports=mongoose.model('Material', materialSchema);