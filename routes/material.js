const express = require('express');
const router = express.Router();

const materialController = require('../controllers/MaterialController');

router.post('/upload', materialController.readExcelData);

router.get('/:customerId', materialController.getCustomerMaterial);

router.get('/previous/:materialId', materialController.getPreviousMaterial);

router.get('/next/:materialId', materialController.getNextMaterial);

module.exports = router;