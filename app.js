const fs= require('fs');
const Path = require('path');
const express = require('express');
const app = express();
const morgan= require('morgan');
const accessLogStream= fs.createWriteStream(Path.join(__dirname,'access.log'),{flags:'a'});
app.use(morgan('combined', { stream: accessLogStream}));
const sequelize = require('./utils/db');
const cors = require('cors');
const userRoutes = require('./routes/userRoute');
const expenseRoutes = require('./routes/expenseRoute');
const authRoutes = require('./routes/authRoute');
const purchaseRoutes = require('./routes/purchaseRoute');
const premiumRoutes = require('./routes/premiumRoute');
const passwordRoutes = require('./routes/passwordRoute');
require('dotenv').config();
//const PORT= process.env.PORT_NUMBER ;

const User = require('./models/User');
const Expense = require('./models/Expense');
const Income = require('./models/Income');
const Order = require('./models/order');
const ForgotPasswordRequest=require('./models/ForgotPasswordRequest');
//require('dotenv').config();

//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from the 'public' directory
app.use(express.static('public'));




// API routes
app.use('/api/user', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api', authRoutes);
// app.use('api/purchase', purchaseRoutes);
app.use('/api/purchase', require('./routes/purchaseRoute'));
app.use('/api/premium', premiumRoutes);
app.use('/password', passwordRoutes);





// Apply associations BEFORE syncing
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);




User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User);


sequelize.sync({alter:true}).then(() => {
  app.listen(3000, () => {
    console.log('Server is running ');
  });
}).catch(err => {
  console.error(' Database sync failed:', err);
});
