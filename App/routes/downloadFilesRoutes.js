const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require("path");
const archiver = require("archiver");

router.get('/files/download', (req, res) => {
  const directoryPath = path.join(__dirname, '../../public/Images');
  const zipFileName = "pliki.zip";
  const output = fs.createWriteStream(zipFileName);
  const archive = archiver("zip", {
    zlib: { level: 9 }
  });

  output.on("close", () => {
    console.log(archive.pointer() + " total bytes");
    console.log("archiver has been finalized and the output file descriptor has closed.");
    res.download(zipFileName);
  });

  archive.on("error", err => {
    throw err;
  });

  archive.pipe(output);

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        archive.file(filePath, { name: file });
      });

      archive.finalize();
    }
  });
});

module.exports = router;