const fs = require('fs');

function showFilesList() {
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