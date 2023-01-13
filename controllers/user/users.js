const User = require('../../models/users');
const { validateUserRegisterSchema } = require('../../validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'fiona.rippin51@ethereal.email',
        pass: '4H5nmvSVY2D2BWBx9r'
    }
});

exports.registerUser = async (req, res, next) => {

    try {
        const { error, value } = validateUserRegisterSchema(req.body);

        if (error) {
            console.log(error.details);
            return res.status(422).json({ success: false, message: "Validate", data: error.details });
        }

        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const email = req.body.email;
        const password = req.body.password;

        encryptedPassword = await bcrypt.hash(password, 10);

        console.log(encryptedPassword);

        const payload = new User({
            firstname: firstname,
            lastname: lastname,
            email: email.toLowerCase(),
            password: encryptedPassword
        });

        const user = await payload.save();

        let result = {
            firstname: user.firstname,
            lastname:user.lastname,
            email: user.email
        }

        let message = {
            from: "fiona.rippin51@ethereal.email",
            to: "mayra.bruen@ethereal.email",
            subject: 'Signup succeeded!',
            html: '<h1>You Successfully Signed up!</h1>'
        };

        transporter.sendMail(message, (err, info) =>{
            if (err) {
                console.log('Error occurred. ' + err.message);
                return process.exit(1);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
        

        return res.status(201).json({ success: true, message: "User Signup Successfully", data: result });

    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, message: "Unable to Signup User, Please try again!", data: null });
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        const expireTime =  3600;

        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token =  jwt.sign(
                {
                    user_id: user._id,
                    email
                },
                process.env.JWT_SECRET_KEY,
                {
                    expiresIn: expireTime+"s"
                }
            );

            console.log(expireTime+"s");

            // save user token
            let result = {
                token: token,
                expiresIn:expireTime
            };

            return res.status(200).json({ success: true, message: "Login Successfully.", data: result });
        }
        return res.status(400).json({ success: false, message: "Invalid credientials.", data: null });

    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, message: "Unable to login user, Please try again!", data: null });
    }
};

exports.getUser = async(req, res) =>{
    let email = req.user.email;
    const user = await User.findOne({ email });
    let result = {
        id:user._id,
        firstname: user.firstname,
        lastname:user.lastname,
        email: user.email
    }
    return res.status(200).json({ success: true, message: "User details.", data: result});   
};
