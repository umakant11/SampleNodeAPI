const express = require('express');

const router = express.Router();

const {verifyToken} = require('../middleware/auth')

const userController = require('../controllers/user/users');

router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser);

router.get('/detail',verifyToken, userController.getUser);

module.exports = router;