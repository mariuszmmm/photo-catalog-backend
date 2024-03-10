const mongoose = require('../config/mongooseConfig');
const Schema = mongoose.Schema;


const itemSchema = new Schema({
  header: { type: String, required: true },
  content: { type: String, required: false },
  image: { type: String },
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;