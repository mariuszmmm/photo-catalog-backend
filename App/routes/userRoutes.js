const express = require("express");
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Visit = require("../models/Visit");
const jwtSecret = process.env.JWT_SECRET;

// Logowanie
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!(username && password)) {
    return res.status(400).json({ message: "WPROWADŹ LOGIN I HASŁO" });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ message: "UŻYTKOWNIK NIE ZOSTAŁ ZNALEZIONY" });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ message: "LOGIN LUB HASŁO NIEPOPRAWNE" });
  }
  const token = jwt.sign({ username, isAdmin: user.isAdmin }, jwtSecret, { expiresIn: '30m' });

  const visitCount = await Visit.countDocuments();
  if (!visitCount) {
    return res.status(500).json({ message: "BŁĄD PODCZAS POBIERANIA LICZBY ODWIEDZIN" });
  }
  res.status(200).json({ token, visitCount });
});

// Zmiana hasła
router.post('/user/password', async (req, res) => {
  const { username, password, newPassword } = req.body;

  if (!(password && newPassword)) {
    return res.status(400).json({ message: "WPROWADŹ HASŁA" });
  }

  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "NIEAUTORYZOWANY UŻYTKOWNIK" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.isAdmin) {
      return res.status(403).json({ message: "ZABRONIONA ZMIANA HASŁA ADMINISTORA" });
    }
  } catch (err) {
    console.error('Błąd weryfikacji tokena:', err);
    return
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: "BRAK UŻYTKOWNIKA" });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ message: "HASŁO NIEPOPRAWNE" });
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;
  await user.save();
  res.status(200).json({ message: "HASŁO ZMIENIONO POMYŚLNIE" });
});

// Dodawanie nowego użytkownika
router.post('/user/add', async (req, res) => {
  const { username, password } = req.body;

  if (!(username && password)) {
    return res.status(400).json({ message: "WPROWADŹ LOGIN I HASŁO" });
  }

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
    .then(items => res.json(items))
    .catch(err => console.error("Błąd przy pobieraniu użytkowników: ", err))
});

module.exports = router;