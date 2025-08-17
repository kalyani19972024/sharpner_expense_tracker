
require('dotenv').config();
const {Sequelize}=require('sequelize');
const DB_PASSWORD=process.env.DB_PASSWORD ;

const sequelize=new Sequelize(process.env.DB_NAME, process.env.DB_USER, DB_PASSWORD,{
     host:'localhost',
     dialect:process.env.DB_DIALECT
});

module.exports=sequelize ;