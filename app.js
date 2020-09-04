const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors")

// routes
const authRoutes = require("./server/routes/auth");
const homeRoutes = require("./server/routes/home");
const { authorize } = require("./server/middleware/authorize");

dotenv.config();
const { NODE_PORT, DATABASE_URL } = process.env;
const app = express();

// middleware
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// routes middleware
app.use("/api", authRoutes);
app.use("/api/home", authorize, homeRoutes);
app.use("*", (__, res) => res.status(400).json({ message: "bad request" }));

// db connection + run server
mongoose
  .connect(DATABASE_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => {
    app.listen(NODE_PORT, () =>
      console.log(`db + server connected::${NODE_PORT}`)
    );
  })
  .catch((err) => console.log("db connection failed"));
