const express = require("express");
const serverless = require("serverless-http");
const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    "message": "Hello World!"
  });
});

router.get("/test", (req, res) => {
  res.json({
    "message": "test"
  });
});

app.use('/api', router);

module.exports.handler = serverless(app);