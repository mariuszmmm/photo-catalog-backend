const express = require("express");
const router = express.Router();
const Item = require('../models/Item');
const multer = require('../config/multerConfig');
const fs = require('fs');

// Pobieranie elementów
router.get("/items", async (req, res) => {
  Item.find()
    .then(items => res.json(items))
    .catch(err => console.error("Błąd przy pobieraniu elementów: ", err))
});

// Dodawanie nowego elementu
router.post('/items', multer.single("file"), (req, res) => {
  const itemData = { content: req.body.content };
  if (req.file) {
    itemData.image = req.file.filename;
  }
  Item.create(itemData)
    .then(result => res.json(result))
    .catch(err => console.error("Błąd przy dodawaniu nowego elementu: ", err))
});

// Edycja elementu
router.put('/items/:id', multer.single("file"), (req, res) => {
  const itemData = { content: req.body.content };
  if (req.file) {
    itemData.image = req.file.filename;
  }
  Item.findByIdAndUpdate(req.params.id, itemData, { new: true })
    .then(result => res.json(result))
    .catch(err => console.error("Błąd przy edycji elementu: ", err))
});

// Usuwanie elementu
router.delete('/items/:id', (req, res) => {
  const id = req.params.id;
  Item.findOne({ _id: id })
    .then(item => {
      if (item.image) {
        fs.unlink(`public/Images/${item.image}`, (err) => {
          if (err) {
            console.error("Błąd przy usuwaniu obrazu podczas usuwania elementu: ", err);
            return;
          }
        });
      }
      Item.deleteOne({ _id: id })
        .then(() => res.status(200).send("Element zostałł pomyślnie usunięty"))
        .catch(err => { res.status(500).send("Błąd przy usuwaniu elementu") });
    })
    .catch(err => {
      console.error("Błąd przy usuwaniu elementu (nie znaleziony): ", err);
      res.status(500).send("Błąd w usuwaniu elementu (nie znaleziony)");
    });
});

// Usuwanie obrazu z elementu
router.put('/items/:id/removeImage', (req, res) => {
  const id = req.params.id;
  Item.findOne({ _id: id })
    .then(item => {
      if (item.image) {
        fs.unlink(`public/Images/${item.image}`, (err) => {
          if (err) {
            console.error("Błąd przy usuwaniu obrazu podczas edycji elementu: ", err);
            return;
          }
          item.image = null;
          item.save()
            .then(() => res.status(200).send("Obraz pomyślnie usunięty"))
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
      console.error("Błąd usunięcia obrazu, element nie znaleziony): ", err);
      res.status(500).send("Błąd usunięcia obrazu, element nie znaleziony");
    });
});

module.exports = router;