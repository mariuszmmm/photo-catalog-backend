const path = require('path');
const copyFiles = require("./copyFiles");

function copyExampleImages() {
  const sourceDir = path.join(__dirname, './Images');
  const destDir = path.join(__dirname, '../../public/Images');

  copyFiles(sourceDir, destDir);
};

module.exports = copyExampleImages;