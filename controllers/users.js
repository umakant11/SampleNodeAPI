const User = require('../models/users');

exports.getAddUser = (req, res, next) => {
    console.log("Add user page!");
    res.render('add_user', 
    {
        pageTitle: 'Add User',
        path: '/user/add',
        formCSS: true,
        userCSS: true,
        activateAddUser: true
    });
    //res.sendFile(path.join(rootDir, 'views','add_user'));
};

exports.postAddUser = (req, res, next) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;

    const user = new User({
        firstname: firstname,
        lastname: lastname
    });

    user.save()
    .then(result =>{
        console.log("User Created");
        res.redirect('/user/');
    })
    .catch(err => {
        console.log(err);
    });
    
};

exports.getUserDetail = (req, res, next) => {
    const userId = req.params.userId;
    User.findById(userId)
    .then(user => {
        res.render('user_detail', { 
            pageTitle:'User',
            path:'/',
            hasUser: true,
            user: user.toJSON()
         });
    })
    .catch(err => {
        console.log(err);
    })
};

exports.viewUsers = (req, res, next) => {
    User.find()
    .then(users => {
        const context = {
            usersDocuments: users.map(user => {
                return {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname
                }
            })
        }
        console.log(context.usersDocuments);
        res.render('home', { 
            pageTitle:'Home',
            path:'/',
            hasUsers: true,
            users: context.usersDocuments
         });
    })
    .catch(err =>{
        console.log(err);
    })
    
    //res.sendFile((path.join(rootDir,'views','home.html')));
};

exports.getEditUser = (req, res, next ) =>{
    const userId = req.params.userId;
    User.findById(userId)
    .then(user => {
        console.log(user);
        res.render('update_user', { 
            pageTitle:'User',
            path:'/user/update',
            hasUser: true,
            user: user.toJSON()
         });
    })
    .catch(err => {
        console.log(err);
    })
};

exports.saveEditUser = (req, res, next) => {
    const userId = req.body.id;
    User.findByIdAndUpdate(userId,{
        firstname: req.body.firstname,
        lastname: req.body.lastname
    })
    .then(user => {
        console.log(user);
        console.log("User updated successfully");
        res.redirect('/user/');
    })
    .catch(err => {
        console.log(err);
    })
};

exports.deleteUser = (req, res, next) => {
    const userId = req.params.userId;
    User.findByIdAndRemove(userId)
    .then(user => {
        console.log("User deleted successfully..");
        res.redirect("/user/");
    })
    .catch(err => {
        console.log(err);
    })
};

