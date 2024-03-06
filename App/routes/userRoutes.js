const express = require("express");
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

// Logowanie
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!(username && password)) {
    return res.status(400).json({ message: 'Wymagany login i hasło' });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: 'Brak w bazie takiego użytkownika' });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ message: 'Nieautoryzowany użytkownik' });
  }
  const token = jwt.sign({ username, isAdmin: user.isAdmin }, jwtSecret, { expiresIn: '30m' });
  res.status(200).json({ token });
});

// Zmiana hasła
router.post('/user/password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  if (!(oldPassword && newPassword)) {
    return res.status(400).json({ message: 'Wprowadź hasła' });
  }

  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Nieautoryzowany użytkownik' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.isAdmin) {
      return res.status(403).json({ message: 'Zablokowana możliwość zmiany hasła administratora' });
    }
  } catch (err) {
    console.error('Błąd weryfikacji tokena:', err);
    return
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: 'Brak w bazie takiego użytkownika' });
  }

  const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ message: 'Nieautoryzowany użytkownik' });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;
  await user.save();
  res.status(200).json({ message: 'Hasło zostało zmienione' });
});

// Dodawanie nowego użytkownika
router.post('/user/add', async (req, res) => {
  const { username, password } = req.body;
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'BRAK TOKENU' });
  }

  const decodedToken = jwt.verify(token, jwtSecret);
  if (!decodedToken.isAdmin) {
    return res.status(403).json({ message: 'UŻYTKOWNIK NIE JEST ADMINSTRATOREM' });
  }

  const user = await User.findOne({ username });
  if (user) {
    return res.status(409).json({ message: 'UŻYTKOWNIK ISTNIEJE' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      isAdmin: false
    });
    await newUser.save();
    res.status(201).json({ message: 'UŻYTKOWNIK ZOSTAŁ UWORZONY POMYŚLNIE' });
  } catch (error) {
    console.error('Błąd podczas tworzenia użytkownika:', error);
    res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
  }
});

// Pobieranie urzytkowników
router.get("/users", (req, res) => {
  User.find()
    .then(items => {
      setTimeout(function () {
        res.json(items)
      }, 500);
    })
    .catch(err => console.error("Błąd przy pobieraniu użytkowników: ", err))
});

module.exports = router;