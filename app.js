const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const mysqlConnection = require("./connection");

const app = express();
app.use(bodyParser.json());
app.use("/users", userRoutes);

app.listen(3000)
