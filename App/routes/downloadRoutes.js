const express = require("express");
const router = express.Router();

router.get('/download/:nazwaPliku', (req, res) => {
  const { nazwaPliku } = req.params;
  const sciezkaDoPliku = `public/Images/${nazwaPliku}`;
  res.download(sciezkaDoPliku);
});

module.exports = router;