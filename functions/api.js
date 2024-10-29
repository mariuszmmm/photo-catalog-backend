const express = require("express");
const serverless = require("serverless-http");
const app = express();

const router = express.Router();

// const mongoose = require('mongoose');
// mongoose.connect(CONNECTION_STRING, {
//   dbName: DATABASENAME
// }).then(() => console.log('Połączono z bazą danych'))
//   .catch((error) => console.error('Błąd podczas łączenia z bazą danych:', error));


router.get("/", (req, res) => {
  res.send("Serwer działa!")
});

router.get("/.netlify/functions/api", (req, res) => {
  res.send("api działa!")
});


app.use('/', router);

module.exports.handler = serverless(app);