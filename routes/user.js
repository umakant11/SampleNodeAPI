const path = require('path');

const express = require('express');

const rootDir = require('../helpers/path');

const userControllers = require('../controllers/users');

const router = express.Router();

router.get('/', userControllers.viewUsers);

router.get('/add', userControllers.getAddUser);

router.post('/add',userControllers.postAddUser);

router.get('/detail/:userId', userControllers.getUserDetail);

router.get('/update/:userId', userControllers.getEditUser);

router.post('/update/:userId', userControllers.saveEditUser);

router.get('/delete/:userId', userControllers.deleteUser);

module.exports = router;
