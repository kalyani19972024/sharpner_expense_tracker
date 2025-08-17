
const express = require('express');
const router = express.Router();
const purchaseController = require("../controllers/purchaseController");
const authenticate = require('../middleware/auth');

router.get('/premiummembership', authenticate, purchaseController.purchasePremium);
router.post('/updatetransactionstatus', purchaseController.updatetransactionstatus);

module.exports = router;

