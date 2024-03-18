const path = require("path");
const fs = require('fs');

function copyFiles(sourceDir, destDir) {
  // Pobierz listę plików w katalogu źródłowym
  fs.readdir(sourceDir, (err, files) => {
    if (err) {
      console.error('Błąd odczytu katalogu źródłowego.', err);
      return;
    }

    // Skopiuj każdy plik do katalogu docelowego
    files.forEach(file => {
      const sourceFile = path.join(sourceDir, file);
      const destFile = path.join(destDir, file);

      // Skopiuj plik
      fs.copyFile(sourceFile, destFile, err => {
        if (err) {
          console.error('Błąd kopiowania pliku.', err);
          return;
        }
        console.log(`Skopiowano plik ${file} do ${destDir}`);
      });
    });
  });
};

module.exports = copyFiles;