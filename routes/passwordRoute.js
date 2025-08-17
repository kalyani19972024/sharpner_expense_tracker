
const express = require('express');
const router = express.Router();
const passwordControllers = require('../controllers/passwordController');
console.log('🔍 passwordControllers:', passwordControllers);

router.post('/forgotpassword', passwordControllers.forgotPassword);
router.get('/resetpassword/:uuid', passwordControllers.renderResetForm); // serves HTML or JSON info
router.post('/resetpassword/:uuid', passwordControllers.resetPassword); // accepts new password

module.exports = router;
