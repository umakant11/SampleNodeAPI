require('dotenv').config();
const path = require('path');
const readXlsxFile = require('read-excel-file/node');
const fs = require('fs');
const { nextTick } = require('process');
const { v4: uuidv4 } = require('uuid');

const Material = require('../models/material');
const { func } = require('joi');
const { truncate } = require('fs/promises');
const { cachedDataVersionTag } = require('v8');

exports.readExcelData = async (req, res) => {
    const filepath = path.join(__dirname, '../', 'public', 'material_2.xlsx');
    //const filepath = path.join(__dirname, '../', 'public', 'material_3_update.xlsx');

    const reader = require('xlsx');

    // Reading our test file
    const file = reader.readFile(filepath);
    const sheets = file.SheetNames;
    const customerId = 'e982f94f-c83a-4538-b7cf-8b95a80eb3c1';
    const projectId = 'b17d375d-5d5b-47b1-8ac9-d1d91bd7815d';
    let data = [];
    let materialExist = await Material.findOne({ projectId: projectId }).exec();
    if (materialExist) {
        console.log("Material compare..");
        let previousId = materialExist.id;
        for (let i = 0; i < sheets.length; i++) {
            const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]], { range: 5 })
            let room = null;
            if (i == 0) {
                for (let j = 0; j < temp.length; j++) {
                    let obj = temp[j];
                    if (obj.hasOwnProperty('ROOM')) {
                        room = obj.ROOM;
                    } else {
                        Object.assign(obj, { "ROOM": room });
                    }
                    Object.assign(obj, { "sheet": sheets[i], "projectId": projectId, "customerId": customerId });
                    let materialObj = await lowercaseKeys(obj);
                    let compareStatus = await compareMaterial(materialObj);
                    if (compareStatus === true) {
                    } else {
                        console.log("Not Match");
                        let existingMaterial = await getMaterialDetail(materialObj);
                        console.log(existingMaterial.id);
                        let material = await materialObj;
                        Object.assign(material, { "previousId": existingMaterial.id, "sequence": existingMaterial.sequence });
                        let newMaterial = await createMaterial(material);
                        console.log("new material id", newMaterial);
                        let updateStatus = await Material.findOneAndUpdate({ id: existingMaterial.id }, { isActive: false, nextId: newMaterial.id });
                    }
                }
            }
        }
    } else {
        console.log("Material create...");
        let sequence= 1;
        for (let i = 0; i < sheets.length; i++) {
            const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]], { range: 5 })
            let room = null;
            if (i == 0) {
                for (let j = 0; j < temp.length; j++) {
                    let obj = temp[j];
                    if (obj.hasOwnProperty('ROOM')) {
                        room = obj.ROOM;
                    } else {
                        Object.assign(obj, { "ROOM": room });
                    }
                    Object.assign(obj, { "sheet": sheets[i], "projectId": projectId, "customerId": customerId, "sequence": sequence });
                    let materialObj = await lowercaseKeys(obj);
                    let object = await createMaterial(materialObj);
                    data.push(materialObj);
                    sequence++;
                }
            }
        }
    }
    return res.status(200).json({ success: true, data: data });
};

const createMaterial = async (materialObj) => {
    let material = await materialObj;
    //console.log(material);
    try {
        const payload = new Material({
            id: uuidv4(),
            projectId: material.projectid,
            customerId: material.customerid,
            sheet: material.sheet,
            room: material.room,
            location: material.location ? material.location : null,
            //model: material.name/model ? material.name/model : null,
            model: null,
            manufacturer: material.manufacturer ? material.manufacturer : null,
            color: material.color ? material.color : null,
            finish: material.finish ? material.finish : null,
            size: material.size ? material.size : null,
            notes: material.notes ? material.notes : null,
            sf: material.sf ? material.sf : null,
            link: material.link ? material.link : null,
            sequence: material.sequence ? material.sequence : null,
            previousId: material.previousId ? material.previousId : null,
            isActive: material.isActive ? material.isActive : true,
        });
        const data = await payload.save();
        return data;
    } catch (err) {
        console.log(err);
    }
};

const compareMaterial = async (materialObj) => {

    let material = await materialObj;
    //console.log(material);
    try {
        let materialExist = await Material.findOne({
            sheet: material.sheet,
            room: material.room,
            location: material.location ? material.location : null,
            model: null,
            manufacturer: material.manufacturer ? material.manufacturer : null,
            color: material.color ? material.color : null,
            finish: material.finish ? material.finish : null,
            size: material.size ? material.size : null,
            notes: material.notes ? material.notes : null,
            sf: material.sf ? material.sf : null,
            previousId: null,
            isActive: true
        }, { id: 1, customerId: 1 }).exec();
        if (materialExist) {
            //console.log(materialExist);
            return true;
        }
        return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}

const getMaterialDetail = async (materialObj) => {
    let material = await materialObj;
    try {
        let data = await Material.findOne({
            sheet: material.sheet,
            room: material.room,
            location: material.location ? material.location : null,
            isActive: true
        }, { id: 1, sequence: 1 }).exec();
        return data;
    } catch (err) {
        console.log(err);
        return false;
    }
}

const lowercaseKeys = async (data) => {
    let obj = await data;
    try {
        const entries = Object.entries(obj);
        return Object.fromEntries(
            entries.map(([key, value]) => {
                return [key.toLowerCase(), value];
            }),
        );
    } catch (err) {
        console.log(err);
    }
}

exports.getCustomerMaterial = async(req, res) => {
    console.log(req.params.customerId);
    try{
        let material = await Material.find(
                        {customerId: req.params.customerId, isActive: true}, 
                        {tag: 0, link: 0, acceptStatus: 0, approveStatus: 0, _id: 0, __v:0, updatedAt:0},)
                        .sort({sequence: 0})
                        .exec();
        if(material){
            return res.status(200).json({ success: true, message: "Material list!", data: material });
        }else{
            return res.status(404).json({ success: false, message: "No records found.", data: null });
        }
        
    }catch(err){
        console.log(err);
        return res.status(500).json({ sucess: false, message: 'Something went wrong!'});
    }
}

exports.getPreviousMaterial = async(req, res) => {
    console.log(req.params.previousId);
    try{
        let material = await Material.findOne(
                        {previousId: req.params.previousId, isActive: false}, 
                        {tag: 0, link: 0, acceptStatus: 0, approveStatus: 0, _id: 0, __v:0, updatedAt:0},)
                        .exec();
        if(material){
            return res.status(200).json({ success: true, message: "Previous material!", data: material });
        }else{
            return res.status(404).json({ success: false, message: "No records found.", data: null });
        }
        
    }catch(err){
        console.log(err);
        return res.status(500).json({ sucess: false, message: 'Something went wrong!'});
    }
}

exports.getNextMaterial = async(req, res) => {
    console.log(req.params.nextId);
    try{
        let material = await Material.findOne(
                        {previousId: req.params.nextId, isActive: false}, 
                        {tag: 0, link: 0, acceptStatus: 0, approveStatus: 0, _id: 0, __v:0, updatedAt:0},)
                        .exec();
        if(material){
            return res.status(200).json({ success: true, message: "Next material!", data: material });
        }else{
            return res.status(404).json({ success: false, message: "No records found.", data: null });
        }
    }catch(err){
        console.log(err);
        return res.status(500).json({ sucess: false, message: 'Something went wrong!'});
    }
}