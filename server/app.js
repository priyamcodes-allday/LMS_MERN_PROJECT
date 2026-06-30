require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser"); 
const cors = require("cors");
const dbCon = require("./config/db");


const app = express();
const port = 5000;
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser()); 
app.use(express.json());
dbCon();


const router = require("../server/modules/MainRoute");
const { errorHandler } = require("./modules/auth/middlewares/errorMiddleware");

app.use(router);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`app is running on ${port}`);
});
