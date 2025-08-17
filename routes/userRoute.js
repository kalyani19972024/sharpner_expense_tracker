
const express=require('express');
const router=express.Router();
const User=require('../models/User');
const authMiddleware = require('../middleware/auth');
const usercontroller=require('../controllers/userController');
const logincontroller=require('../controllers/loginController');

router.post('/signup', usercontroller.adduser);
router.post('/login', logincontroller.login);
router.get('/status', authMiddleware, usercontroller.checkPremiumStatus);
router.put('/income', usercontroller.updateIncome);



module.exports=router ;