require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");//By ranit
const cors = require("cors");

const dbCon = require("./config/db");
const courseRoutes = require("./course/routes/courseRoutes"); // By Priyam
const categoryRoutes = require("./course/routes/categoryRoutes"); // By Priyam

const authRoutes = require("./auth/routes/authRoutes");
const userRoutes=require('./auth/routes/userRoutes')//By ranit

const app = express();
const port = 5000;
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(cookieParser());//By ranit
app.use(express.json());
dbCon();
app.use("/api",authRoutes);//By ranit
app.use('/api/user',userRoutes)//By ranit
app.use("/api/v1/courses", courseRoutes); // By Priyam
app.use("/api/v1/categories", categoryRoutes); // By Priyam

app.listen(port, () => {
  console.log(`app is running on ${port}`);
});
