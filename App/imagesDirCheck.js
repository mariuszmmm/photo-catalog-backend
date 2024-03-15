const path = require("path");
const fs = require('fs');
require('dotenv').config();
const DATABASENAME = process.env.DATABASENAME;


function imagesDirCheck() {
  const imagesDirectory = path.join(__dirname, `../${DATABASENAME}/public/Images`);
  if (!fs.existsSync(imagesDirectory)) {
    fs.mkdirSync(imagesDirectory, { recursive: true });
    console.log('Katalog "Images" został stworzony.');
  } else {

    fs.mkdirSync(imagesDirectory, { recursive: true });

    console.log('Katalog "Images" już istnieje.');
  }
};

module.exports = imagesDirCheck;