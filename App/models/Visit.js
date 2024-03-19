const mongoose = require('../config/mongooseConfig');
const Schema = mongoose.Schema;


const visitSchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
});

const Visit = mongoose.model('Visit', visitSchema);

module.exports = Visit;