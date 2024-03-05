const path = require("path");
const fs = require('fs');

function imageDirCheck() {
  const imagesDirectory = path.join(__dirname, './public/Images');
  if (!fs.existsSync(imagesDirectory)) {
    fs.mkdirSync(imagesDirectory, { recursive: true });
    console.log('Katalog "Images" został stworzony.');
  } else {
    console.log('Katalog "Images" już istnieje.');
  }
}

module.exports = imageDirCheck;
