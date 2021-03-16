const express = require('express');
const app = express();

app.use((req, res) => {
  res.send("test123");
})

app.listen(3000, () => {
  console.log('back-end server listening on port 3000');
})