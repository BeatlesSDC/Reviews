const express = require('express');
const app = express();

const db = require('./database');
console.log(db);

app.listen(3000, () => {
  console.log('back-end server listening on port 3000');
})