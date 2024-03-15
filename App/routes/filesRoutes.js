const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require("path");

router.get('/files', (req, res) => {
  const directoryPath = path.join(__dirname, '../../public/Images');

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send('Wystąpił błąd podczas odczytu folderu.');
    }

    res.json(files);
  });
});

module.exports = router;