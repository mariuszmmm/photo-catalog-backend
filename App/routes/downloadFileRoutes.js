const express = require("express");
const router = express.Router();

router.get('/files/download/:nazwaPliku', (req, res) => {
  const { filenName } = req.params;
  const directoryPath = `public/Images/${filenName}`;
  res.download(directoryPath);
});

module.exports = router;