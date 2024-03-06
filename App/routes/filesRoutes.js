const express = require("express");
const router = express.Router();
const fs = require('fs');

router.get('/files', (req, res) => {
  const directoryPath = path.join(__dirname, 'public', 'Images');

  // Odczytaj zawartość folderu
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send('Wystąpił błąd podczas odczytu folderu.');
    }

    // Zwróć listę plików
    res.json(files);
  });
});

module.exports = router;