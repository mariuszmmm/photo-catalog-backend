const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
const userRoutes = require('./App/routes/userRoutes');
const itemRoutes = require('./App/routes/itemRoutes');
const filesRoutes = require('./App/routes/filesRoutes');
const adminCheck = require('./App/adminCheck');
const imageDirCheck = require('./App/imageDirCheck');
const showFilesList = require('./App/showFilesList');

require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use('/', userRoutes);
app.use('/', itemRoutes);
app.use('/', filesRoutes);

app.use('/files', express.static('public/Images'));

adminCheck();
imageDirCheck();
showFilesList();

// const path = require("path");
// const fs = require('fs');

// router.get('/files', (req, res) => {
//   const directoryPath = path.join(__dirname, 'public', 'Images');
//   console.log('Ścieżka do katalogu:', directoryPath);
//   // Odczytaj zawartość folderu
//   fs.readdir(directoryPath, (err, files) => {
//     if (err) {
//       return res.status(500).send('Wystąpił błąd podczas odczytu folderu.');
//     }

//     // Zwróć listę plików
//     res.json(files);
//   });
// });




// Udostępnianie folderu, w którym przechowywane są pliki

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
