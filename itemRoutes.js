const express = require("express");
const router = express.Router();
const Item = require('./Item');
const multer = require('./multerConfig');

const fs = require('fs');

// Endpoint do pobierania zadań
router.get("/items", async (req, res) => {
  Item.find() // Znajduje wszystkie zadania w bazie danych
    .then(items => {
      setTimeout(function () {
        res.json(items) // Wysyła odpowiedź z danymi
      }, 500);
    })
    .catch(err => console.error("Błąd przy pobieraniu zadań: ", err))
});

// Endpoint do dodawania nowego zadania
router.post('/items', multer.single("file"), (req, res) => {
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
router.put('/items/:id', multer.single("file"), (req, res) => {
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
router.delete('/items/:id', (req, res) => {
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
router.put('/items/:id/removeImage', (req, res) => {
  const id = req.params.id;
  Item.findOne({ _id: id }) // Znajduje zadanie w bazie danych
    .then(item => {
      if (item.image) {
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

module.exports = router;