require("dotenv").config()
const express=require('express')
const cors = require("cors");
const dbCon=require('./auth/app/config/db')
const authRoutes=require('./auth/app/routes/authroutes')

const app=express()
const port=5000
app.use(cors({
    origin:"http://localhost:5173"
  }));
app.use(express.json())
dbCon()
app.use('/api',authRoutes)

app.listen(port,()=>{
    console.log(`app is running on ${port}`)
})