require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser"); //By ranit
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
app.use(cookieParser()); //By ranit
app.use(express.json());
dbCon();

const router = require("../server/modules/MainRoute");
const { errorHandler } = require("./modules/auth/middlewares/errorMiddleware");

app.use(router);

// Global Error Handler must be the last middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`app is running on ${port}`);
});
