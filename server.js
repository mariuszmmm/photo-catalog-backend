const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
const userRoutes = require('./userRoutes');
const itemRoutes = require('./itemRoutes');

require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.json());

app.use('/', userRoutes);
app.use('/', itemRoutes);

const path = require("path");
const User = require('./User');
const bcrypt = require('bcryptjs');

const fs = require('fs');

const jwtDecode = require('jwt-decode');

const imagesDirectory = path.join(__dirname, 'public/Images');
if (!fs.existsSync(imagesDirectory)) {
  fs.mkdirSync(imagesDirectory, { recursive: true });
  console.log('Katalog "Images" został stworzony.');
} else {
  console.log('Katalog "Images" już istnieje.');
}

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

// Info Serwer działa
app.get("/", (req, res) => {
  res.send("Serwer działa")
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server działa na porcie ${port}`));