const Item = require('../models/Item');
const fs = require('fs');

async function loadExampleItems() {
  const itemsData = JSON.parse(fs.readFileSync('App/example/items.json', 'utf8'));

   await Item.insertMany(itemsData)
    .then(() => {
      console.log('LoadExampleItems: zakończony pomyślnie');
    })
    .catch((err) => {
      console.error('LoadExampleItems: Błąd', err);
    });
};

module.exports = loadExampleItems;