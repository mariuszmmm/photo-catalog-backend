const mongoose = require('mongoose');
require('dotenv').config();
const CONNECTION_STRING = process.env.CONNECTION_STRING;
const DATABASENAME = process.env.DATABASENAME;

mongoose.connect(CONNECTION_STRING, {
  dbName: DATABASENAME
}).then(() => console.log('Połączono z bazą danych'))
  .catch((error) => console.error('Błąd podczas łączenia z bazą danych:', error));

module.exports = mongoose;