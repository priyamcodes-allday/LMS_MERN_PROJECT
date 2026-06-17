const mongoose=require('mongoose')

const databaseConnection=async()=>{
    mongoose.connect(process.env.MONGODB_URL)
    console.log('databse connected successfully')
}
module.exports=databaseConnection