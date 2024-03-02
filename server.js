require('dotenv').config(); // Wczytanie zmiennych środowiskowych
const express = require("express"); // Express to framework do tworzenia aplikacji webowych na platformie Node.js
const cors = require("cors"); // CORS (Cross-Origin Resource Sharing) to mechanizm umożliwiający wielu zasobom (np. czcionki, JavaScript, itp.) udostępnianie zasobów pochodzących z innego źródła niż bieżące
const mongoose = require('mongoose'); // Mongoose to biblioteka Node.js, która ułatwia pracę z MongoDB
const multer = require('multer'); // Multer to middleware obsługujący multipart/form-data, który jest używany do przesyłania plików
const path = require("path"); // Moduł Path zapewnia narzędzia do pracy ze ścieżkami plików i katalogów
const fs = require('fs'); // Moduł File System (fs) pozwala na interakcję z systemem plików na komputerze
const jwtDecode = require('jwt-decode');

const app = express(); // Inicjalizacja aplikacji Express
const imagesDirectory = path.join(__dirname, 'public/Images'); // Ścieżka do głównego katalogu

// Sprawdzenie, czy katalog istnieje, a jeśli nie, to stworzenie go
if (!fs.existsSync(imagesDirectory)) {
  fs.mkdirSync(imagesDirectory, { recursive: true });
  console.log('Katalog "Images" został stworzony.');
} else {
  console.log('Katalog "Images" już istnieje.');
}

app.use(cors()); // Pozwala na obsługę CORS
app.use(express.json()); // Obsługuje dane wejściowe w formacie JSON
app.use(express.static("public")); // Obsługuje statyczne pliki z katalogu "public"

// Definicja portu i danych do połączenia z bazą danych
const port = process.env.PORT || 5000;
const CONNECTION_STRING = process.env.CONNECTION_STRING;
const DATABASENAME = "PhotoCatalog";

// Definicja schematu i modelu Mongoose
const itemSchema = new mongoose.Schema({
  content: String,
  image: String, // ścieżka do pliku obrazu
});
const Item = mongoose.model('Item', itemSchema); // Model reprezentuje dokumenty w bazie danych MongoDB

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

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


const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
app.use(bodyParser.json());

const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;
const jwtSecret = process.env.JWT_SECRET;

// Sprawdzenie czy istnieje administrator
User.findOne({ isAdmin: true }).then(admin => {
  if (!admin) {
    // Jeśli nie istnieje, utwórz nowego administratora
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    bcrypt.hash(adminPassword, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Błąd hashowania hasła:', err);
        return;
      }

      const newAdmin = new User({
        username: adminUsername,
        password: hashedPassword,
        isAdmin: true
      });

      newAdmin.save().then(() => {
        console.log('Tworzenie konta administratora');
      }).catch(err => {
        console.error('Błąd podczas tworzenia konta administratora:', err);
      });
    });
  }
});

// Logowanie
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!(username && password)) {
    return res.status(400).json({ message: 'Wymagany login i hasło' });
  }

  // Wyszukiwanie użytkownika w bazie danych
  const user = await User.findOne({ username });

  // Sprawdzenie czy użytkownik istnieje
  if (!user) {
    return res.status(404).json({ message: 'Brak w bazie takiego użytkownika' });
  }
  // Sprawdzenie poprawności hasła
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ message: 'Nieautoryzowany użytkownik' });
  }
  console.log("isPasswordCorrect: ", isPasswordCorrect)
  // Generowanie tokena JWT
  const token = jwt.sign({ username, isAdmin: user.isAdmin }, jwtSecret, { expiresIn: '5h' });

  res.status(200).json({ token });
  // console.log("logowanie - token : ", token)
});

// Zmiana hasła
app.post('/user/password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  if (!(oldPassword && newPassword)) {
    return res.status(400).json({ message: 'Wprowadź hasła' });
  }

  const token = req.headers.authorization;
  console.log(token)

  if (!token) {
    return res.status(401).json({ message: 'Nieautoryzowany użytkownik' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Zdekodowany ładunek tokena JWT:', decoded);
  } catch (err) {
    console.error('Błąd weryfikacji tokena:', err);
    return
  }

  // Wyszukiwanie użytkownika w bazie danych
  const user = await User.findOne({ username });

  // Sprawdzenie czy użytkownik istnieje
  if (!user) {
    return res.status(401).json({ message: 'Brak w bazie takiego użytkownik' });
  }

  const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ message: 'Nieautoryzowany użytkownik' });
  }
  console.log(isPasswordCorrect)
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedNewPassword;
  await user.save();
  console.log("hasło wysłane do bazy:", hashedNewPassword)


  res.status(200).json({ message: 'Hasło zostało zmienione' });
});

// Dodawanie nowego użytkownika przez administratora
app.post('/user/add', async (req, res) => {
  const { username, password } = req.body;

  // Sprawdzenie czy żądanie pochodzi od administratora
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Nieautoryzowany użytkownik' });
  }

  try {
    // Weryfikacja tokenu JWT
    const decodedToken = jwt.verify(token, jwtSecret);

    // Sprawdzenie czy użytkownik jest administratorem
    if (!decodedToken.isAdmin) {
      return res.status(403).json({ message: 'Działanie zabronione' });
    }

    // Tworzenie nowego użytkownika
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      isAdmin: false // Nowy użytkownik nie jest administratorem
    });
    await newUser.save();

    res.status(201).json({ message: 'Użytkownik został utworzony pomyślnie' });
  } catch (error) {
    console.error('Błąd podczas tworzenia użytkownika:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// Info Serwer działa
app.get("/", (req, res) => {
  res.send("Serwer działa")
});

// Endpoint do pobierania zadań
app.get("/items", async (req, res) => {
  const token = req.headers.authorization.split(' ')[1]; // Pobranie 

  if (!token) {
    return res.status(401).json({ message: 'Nieautoryzowany użytkownik' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Zdekodowany ładunek tokena JWT:', decoded);
  } catch (err) {
    console.error('Błąd weryfikacji tokena:', err);
    return
  }

  Item.find() // Znajduje wszystkie zadania w bazie danych
    .then(items => {
      setTimeout(function () {
        res.json(items) // Wysyła odpowiedź z danymi
      }, 500);
    })
    .catch(err => console.error("Błąd przy pobieraniu zadań: ", err))
});

// Endpoint do pobierania użykowników
app.get("/users", (req, res) => {
  User.find() // Znajduje wszystkich użytkowników w bazie danych
    .then(items => {
      setTimeout(function () {
        res.json(items) // Wysyła odpowiedź z danymi
      }, 500);
    })
    .catch(err => console.error("Błąd przy pobieraniu użytkowników: ", err))
});

// Endpoint do dodawania nowego zadania
app.post('/items', upload.single("file"), (req, res) => {
  const itemData = {
    content: req.body.content,
  };
  if (req.file) {
    itemData.image = req.file.filename; // Dodaje nazwę pliku do danych zadania
  }
  Item.create(itemData) // Tworzy nowe zadanie w bazie danych
    .then(result => res.json(result)) // Wysyła odpowiedź z wynikiem
    .catch(err => console.error("Błąd przy dodawaniu nowego zadania: ", err))
})

// Endpoint do edycji zadania
app.put('/items/:id', upload.single("file"), (req, res) => {
  const itemData = {
    content: req.body.content,
  };
  if (req.file) {
    itemData.image = req.file.filename; // Dodaje nazwę pliku do danych zadania
  }
  Item.findByIdAndUpdate(req.params.id, itemData, { new: true }) // Aktualizuje zadanie w bazie danych
    .then(result => res.json(result)) // Wysyła odpowiedź z wynikiem
    .catch(err => console.error("Błąd przy edycji zadania: ", err))
})

// Endpoint do usuwania zadania
app.delete('/items/:id', (req, res) => {
  const id = req.params.id;
  Item.findOne({ _id: id }) // Znajduje zadanie w bazie danych
    .then(item => {
      if (item.image) {
        fs.unlink(`public/Images/${item.image}`, (err) => { // Usuwa obraz z zadania
          if (err) {
            console.error("Błąd przy usuwaniu obrazu podczas usuwania zadania: ", err);
            return;
          }
        });
      }
      Item.deleteOne({ _id: id }) // Usuwa zadanie z bazy danych
        .then(() => res.status(200).send("Zadanie zostało pomyślnie usunięte")) // Wysyła odpowiedź z potwierdzeniem usunięcia
        .catch(err => {
          res.status(500).send("Błąd przy usuwaniu zadania");
        });
    })
    .catch(err => {
      console.error("Błąd przy usuwaniu zadania (nie znalezione): ", err);
      res.status(500).send("Błąd w usuwaniu zadania (nie znalezione)");
    });
});

// Endpoint do usuwania obrazu w edycji zadania
app.put('/items/:id/removeImage', (req, res) => {
  const id = req.params.id;
  Item.findOne({ _id: id }) // Znajduje zadanie w bazie danych
    .then(item => {
      if (v.image) {
        fs.unlink(`public/Images/${item.image}`, (err) => { // Usuwa obraz z zadania
          if (err) {
            console.error("Błąd przy usuwaniu obrazu podczas edycji zadania: ", err);
            return;
          }
          // Usuń nazwę pliku obrazu z zadania
          item.image = null;
          item.save() // Zapisuje zmiany w zadaniu
            .then(() => res.status(200).send("Obraz pomyślnie usunięty")) // Wysyła odpowiedź z potwierdzeniem usunięcia obrazu
            .catch(err => {
              console.error(err);
              res.status(500).send("Błąd przy usuwaniu obrazu");
            });
        });
      } else {
        res.status(404).send("Brak obrazu do usunięcia");
      }
    })
    .catch(err => {
      console.error("Błąd przy usuwaniu obrazu w edycji zadania (nie znalezione): ", err);
      res.status(500).send("Błąd w usuwaniu obrazu w edycji zadania (nie znalezione)");
    });
});

// Uruchomienie serwera na określonym porcie
app.listen(port, () => console.log(`Server działa na porcie ${port}`));