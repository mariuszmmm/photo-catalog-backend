// Wczytanie zmiennych środowiskowych
require('dotenv').config();

// Importowanie potrzebnych modułów
const express = require("express"); // Express to framework do tworzenia aplikacji webowych na platformie Node.js
const cors = require("cors"); // CORS (Cross-Origin Resource Sharing) to mechanizm umożliwiający wielu zasobom (np. czcionki, JavaScript, itp.) udostępnianie zasobów pochodzących z innego źródła niż bieżące
const mongoose = require('mongoose'); // Mongoose to biblioteka Node.js, która ułatwia pracę z MongoDB
const multer = require('multer'); // Multer to middleware obsługujący multipart/form-data, który jest używany do przesyłania plików
const path = require("path"); // Moduł Path zapewnia narzędzia do pracy ze ścieżkami plików i katalogów
const fs = require('fs'); // Moduł File System (fs) pozwala na interakcję z systemem plików na komputerze

// Inicjalizacja aplikacji Express
const app = express();

// Dodanie middleware do aplikacji
app.use(cors()); // Pozwala na obsługę CORS
app.use(express.json()); // Obsługuje dane wejściowe w formacie JSON
app.use(express.static("public")); // Obsługuje statyczne pliki z katalogu "public"

// Definicja portu i danych do połączenia z bazą danych
const port = process.env.PORT || 5000;
const CONNECTION_STRING = process.env.CONNECTION_STRING;
const DATABASENAME = "tasksdb";
const COLLECTIONNAME = "tasks";

// Definicja schematu i modelu Mongoose
const taskSchema = new mongoose.Schema({
  content: String,
  image: String, // ścieżka do pliku obrazu
});
const Task = mongoose.model('Task', taskSchema); // Model reprezentuje dokumenty w bazie danych MongoDB

// Konfiguracja Multer do obsługi plików
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/Images") // Określa miejsce przechowywania plików
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname)) // Określa nazwę pliku
  }
})

const upload = multer({ storage: storage }); // Inicjalizacja Multer z określonym miejscem przechowywania

// Połączenie z bazą danych
mongoose.connect(CONNECTION_STRING, {
  dbName: DATABASENAME
}).then(() => console.log('Połączono z bazą danych'))
  .catch((error) => console.error('Błąd podczas łączenia z bazą danych:', error));

// Endpoint do pobierania zadań
app.get("/tasks", (req, res) => {
  Task.find() // Znajduje wszystkie zadania w bazie danych
    .then(user => {
      setTimeout(function () {
        res.json(user) // Wysyła odpowiedź z danymi użytkownika
      }, 500);
    })
    .catch(err => console.error("błąd w pobieraniu zadań: ", err))
});

// Endpoint do dodawania nowego zadania
app.post('/tasks', upload.single("file"), (req, res) => {
  const taskData = {
    content: req.body.content,
  };
  if (req.file) {
    taskData.image = req.file.filename; // Dodaje nazwę pliku do danych zadania
  }
  Task.create(taskData) // Tworzy nowe zadanie w bazie danych
    .then(result => res.json(result)) // Wysyła odpowiedź z wynikiem
    .catch(err => console.error("błąd w dodawaniu nowego zadania: ", err))
})

// Endpoint do edycji zadania
app.put('/tasks/:id', upload.single("file"), (req, res) => {
  const taskData = {
    content: req.body.content,
  };
  if (req.file) {
    taskData.image = req.file.filename; // Dodaje nazwę pliku do danych zadania
  }
  Task.findByIdAndUpdate(req.params.id, taskData, { new: true }) // Aktualizuje zadanie w bazie danych
    .then(result => res.json(result)) // Wysyła odpowiedź z wynikiem
    .catch(err => console.error("błąd w edycji zadania: ", err))
})

// Endpoint do usuwania zadania
app.delete('/tasks/:id', (req, res) => {
  const id = req.params.id;
  Task.findOne({ _id: id }) // Znajduje zadanie w bazie danych
    .then(task => {
      if (task.image) {
        fs.unlink(`public/Images/${task.image}`, (err) => { // Usuwa obraz z zadania
          if (err) {
            console.error("błąd w usuwaniu obrazu przy usuwanie zadania: ", err);
            return;
          }
        });
      }
      Task.deleteOne({ _id: id }) // Usuwa zadanie z bazy danych
        .then(() => res.status(200).send("Task deleted successfully")) // Wysyła odpowiedź z potwierdzeniem usunięcia
        .catch(err => {
          console.error("błąd w usuwaniu zadania: ", err);
          res.status(500).send("Błąd w usuwaniu zadania");
        });
    })
    .catch(err => {
      console.error("błąd w usuwaniu zadania (nie znalezione): ", err);
      res.status(500).send("Błąd w usuwaniu zadania (nie znalezione)");
    });
});

// Endpoint do usuwania obrazu w edycji zadania
app.put('/tasks/:id/removeImage', (req, res) => {
  const id = req.params.id;
  Task.findOne({ _id: id }) // Znajduje zadanie w bazie danych
    .then(task => {
      if (task.image) {
        fs.unlink(`public/Images/${task.image}`, (err) => { // Usuwa obraz z zadania
          if (err) {
            console.error("błąd w usuwaniu obrazu w edycji zadania: ", err);
            return;
          }
          // Usuń nazwę pliku obrazu z zadania
          task.image = null;
          task.save() // Zapisuje zmiany w zadaniu
            .then(() => res.status(200).send("Image deleted successfully")) // Wysyła odpowiedź z potwierdzeniem usunięcia obrazu
            .catch(err => {
              console.error(err);
              res.status(500).send("Error updating task");
            });
        });
      } else {
        res.status(404).send("No image to delete");
      }
    })
    .catch(err => {
      console.error("błąd w usuwaniu obrazu w edycji zadania (nie znalezione): ", err);
      res.status(500).send("Błąd w usuwaniu obrazu w edycji zadania (nie znalezione)");
    });
});

// Uruchomienie serwera na określonym porcie
app.listen(port, () => console.log(`Server is running on port ${port}`));