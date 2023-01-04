const User = require('../models/users');
const {validateUserSchema} = require("../validator");

exports.getUsers = (req, res, next) => {
    User.find()
    .select('-__v')
    .then(users => {
        return res.status(200).json({ success: true, data: users });
    })
    .catch(err =>{
        console.log(err);
    })
};

exports.getUserDetail = (req, res, next) => {
    const userId = req.params.userId;
    User.find({_id: userId})
    .select('-__v', '-_id')
    .then(user => {
        return res.status(200).json({ success: true, message:"User detail", data: user });
    })
    .catch(err =>{
        console.log(err);
        return res.status(404).json({ success: false, message: "No Record Found", data : null });
    })
};

exports.saveUser = (req, res, next) => {
    const { error, value } = validateUserSchema(req.body);
    
    if(error){
        console.log(error.details);
        return res.status(422).json({ success: false, message:"Validate", data: error.details });
    }

    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    
    const user = new User({
        firstname: firstname,
        lastname: lastname
    });

    user.save()
    .then(user =>{
        return res.status(201).json({ success: true, message:"User save successfully", data: user });
    })
    .catch(err => {
        console.log(err);
        return res.status(400).json({ success: false, message:"Unable to save user, Please try again!", data: null });
    });
    
};

exports.updateUser = (req, res, next) => {
    const userId = req.params.userId;
    User.findByIdAndUpdate(userId,{
        firstname: req.body.firstname,
        lastname: req.body.lastname
    })
    .select('-__v')
    .then(user => {
        return res.status(200).json({ success: true, message:"User updated successfully", data: user });
    })
    .catch(err => {
        return res.status(400).json({ success: false, message:"Unable to update user, Please try again!", data:null });
    })
};

exports.deleteUser = (req, res, next) => {
    const userId = req.params.userId;
    User.findByIdAndRemove(userId)
    .select('-__v')
    .then(user => {
        return res.status(200).json({ success: true, message:"User deleted successfully", data: user });
    })
    .catch(err => {
        return res.status(400).json({ success: false, message:"Unable to delete user, Please try again!", data:null });
    })
};
