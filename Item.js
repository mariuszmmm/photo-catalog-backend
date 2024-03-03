const mongoose = require('./mongooseConfig');
const Schema = mongoose.Schema;


const itemSchema = new Schema({
  content: { type: String, required: true },
  image: { type: String },
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;