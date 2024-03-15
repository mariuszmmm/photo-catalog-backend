const express = require("express");
const router = express.Router();
const path = require("path");

router.get('/files/download/:fileName', (req, res) => {
  const { fileName } = req.params;
  const directoryPath = path.join(__dirname, `../../public/Images/${fileName}`);

  res.download(directoryPath);
});

module.exports = router;