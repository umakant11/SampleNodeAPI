const User = require('../../models/users');
const {validateUserSchema} = require("../../validator");

exports.getUsers1 = (req, res, next) => {
    User.find()
    .select('-__v')
    .then(users => {
        return res.status(200).json({ success: true, data: users });
    })
    .catch(err =>{
        console.log(err);
    })
};

// Get all Users list
exports.getUsers = async (req, res, next) => {

try{
  let totalUser = await User.countDocuments();
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let perPage = req.query.perpage ? parseInt(req.query.perpage) : 10;
  let offset = 0;

  if (page > 1) {
    offset = page * perPage - perPage;
  }

  let users = await User.find()
    .skip(offset)
    .select('-__v')
    .limit(perPage)
    .sort({ id: -1 })
    .exec();

  var pagination = {
    page: page,
    perPage: perPage,
    totalPages: 0,
    totalRecords: 0,
    startRecord: 0,
    endRecord: 0,
  };

  if (users.length > 0) {
    pagination = {
      page: page,
      perPage: perPage,
      totalPages: parseInt(Math.ceil(totalUser / perPage)),
      totalRecords: totalUser,
      startRecord: page * perPage - perPage + 1,
      endRecord: totalUser < page * perPage ? totalUser : page * perPage,
    };
    
    return res
      .status(200)
      .json({ success: true, data: users, pagination: pagination });
  }
  return res
      .status(200)
      .json({ success: true, data: null, pagination: pagination });
}catch(error){
    
    return res.status(500).send({success:false,message:error.messages})
}
};

exports.getUserDetail = (req, res, next) => {
    const userId = req.params.userId;
    User.find({_id: userId})
    .select('firstname lastname -_id')
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
