const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
const userRoutes = require('./App/routes/userRoutes');
const itemRoutes = require('./App/routes/itemRoutes');
const adminCheck = require('./App/adminCheck');
const imageDirCheck = require('./App/imageDirCheck');

require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use('/', userRoutes);
app.use('/', itemRoutes);

adminCheck();
imageDirCheck();


const fs = require('fs');

// Ścieżka do folderu, w którym przechowywane są pliki
const folderPath = 'public/Images';

// Wyświetlanie listy plików w konsoli
fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error('Błąd podczas odczytywania listy plików:', err);
    return;
  }
  console.log('Lista plików:');
  files.forEach(file => {
    console.log(file);
  });
});


// Udostępnianie folderu, w którym przechowywane są pliki
app.use('/files', express.static('public/Images'));

// Endpoint do pobierania pliku
app.get('/download/:nazwaPliku', (req, res) => {
  const { nazwaPliku } = req.params;
  const sciezkaDoPliku = `public/Images/${nazwaPliku}`;
  res.download(sciezkaDoPliku);
});






app.get("/", (req, res) => {
  res.send("Serwer działa")
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server działa na porcie ${port}`));
