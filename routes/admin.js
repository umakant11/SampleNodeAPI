const express = require('express');

const adminControllers = require('../controllers/admin');

const router = express.Router();

router.get('/', adminControllers.getUsers);

router.get('/:userId', adminControllers.getUserDetail);

router.post('/', adminControllers.saveUser);

router.put('/:userId', adminControllers.updateUser);

router.delete('/:userId', adminControllers.deleteUser);

module.exports = router;
