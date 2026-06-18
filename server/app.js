require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbCon = require("./config/db");
const authRoutes = require("./auth/app/routes/authroutes");
const courseRoutes = require("./course/routes/courseRoutes"); // By Priyam
const categoryRoutes = require("./course/routes/categoryRoutes"); // By Priyam

const app = express();
const port = 5000;
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());
dbCon();
app.use("/api", authRoutes);
app.use("/api/v1/courses", courseRoutes); // By Priyam
app.use("/api/v1/categories", categoryRoutes); // By Priyam

app.listen(port, () => {
  console.log(`app is running on ${port}`);
});
