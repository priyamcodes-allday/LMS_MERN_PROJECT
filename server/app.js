require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser"); //By ranit
const cors = require("cors");
const dbCon = require("./config/db");
const courseRoutes = require("./course/routes/courseRoutes"); // By Priyam
const categoryRoutes = require("./course/routes/categoryRoutes"); // By Priyam
const enrollmentRoutes = require("./course/routes/enrollmentRoutes"); // By Priyam
const cartRoutes = require("./course/routes/cartRoutes"); // By Priyam
const progressRoutes = require("./course/routes/progressRoutes"); // By Priyam
const wishlistRoutes = require("./course/routes/wishlistRoutes"); // By Priyam
const reviewRoutes = require("./course/routes/reviewRoutes"); // By Priyam
const authRoutes = require("./auth/routes/authRoutes"); //by ranit
const userRoutes = require("./auth/routes/userRoutes"); //By ranit
const adminRoutes = require("./auth/routes/adminRoutes");//By ranit
const teacherRoutes=require('./auth/routes/teacherRoutes')//by ranit

const app = express();
const port = 5000;
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(cookieParser()); //By ranit
app.use(express.json());
dbCon();
app.use("/api", authRoutes); //By ranit
app.use("/api/user", userRoutes); //By ranit
app.use("/api/admin", adminRoutes); //By ranit
app.use('/api/teacher',teacherRoutes)//by ranit
app.use("/api/v1/courses", courseRoutes); // By Priyam
app.use("/api/v1/categories", categoryRoutes); // By Priyam
app.use("/api/v1/enrollments", enrollmentRoutes); // By Priyam
app.use("/api/v1/cart", cartRoutes); // By Priyam
app.use("/api/v1/wishlist", wishlistRoutes); // By Priyam
app.use("/api/v1/progress", progressRoutes); // By Priyam
app.use("/api/v1/reviews", reviewRoutes); // By Priyam

app.listen(port, () => {
  console.log(`app is running on ${port}`);
});
