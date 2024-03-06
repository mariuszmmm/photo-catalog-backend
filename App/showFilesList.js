

// const path = require("path");
const fs = require('fs');

// function imageDirCheck() {
//   const imagesDirectory = path.join(__dirname, '../public/Images');
//   if (!fs.existsSync(imagesDirectory)) {
//     fs.mkdirSync(imagesDirectory, { recursive: true });
//     console.log('Katalog "Images" został stworzony.');
//   } else {
//     console.log('Katalog "Images" już istnieje.');
//   }
// }

// module.exports = imageDirCheck;

function showFilesList() {
// Wyświetlanie listy plików w konsoli
fs.readdir('public/Images', (err, files) => {
  if (err) {
    console.error('Błąd podczas odczytywania listy plików:', err);
    return;
  }
  console.log('Lista plików:');
  files.forEach(file => {
    console.log(file);
  });
});
}

module.exports = showFilesList;