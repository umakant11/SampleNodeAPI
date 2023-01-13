const path = require('path');

const express = require('express');

const rootDir = require('../helpers/path');

const homeControllers = require('../controllers/home');

const router = express.Router();

router.get('/', homeControllers.viewUsers);

router.get('/add', homeControllers.getAddUser);

router.post('/add',homeControllers.postAddUser);

router.get('/detail/:userId', homeControllers.getUserDetail);

router.get('/update/:userId', homeControllers.getEditUser);

router.post('/update/:userId', homeControllers.saveEditUser);

router.get('/delete/:userId', homeControllers.deleteUser);

module.exports = router;
