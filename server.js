const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
const userRoutes = require('./App/routes/userRoutes');
const itemRoutes = require('./App/routes/itemRoutes');
const filesRoutes = require('./App/routes/filesRoutes');
const downloadRoutes = require('./App/routes/downloadRoutes');
const adminCheck = require('./App/adminCheck');
const imagesDirCheck = require('./App/imagesDirCheck');

require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use('/', userRoutes);
app.use('/', itemRoutes);
app.use('/', filesRoutes);
app.use('/', downloadRoutes);
app.use('/files', express.static('public/Images'));

adminCheck();
imagesDirCheck();

app.get("/", (req, res) => {
  res.send("Serwer działa")
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server działa na porcie ${port}`));
