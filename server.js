const express = require('express');
const app = express();
app.use(express.json());

const db = require('./database');

app.get('/reviews', (req, res) => {
  let product = req.query.product_id;
  let page = req.query.page || 1;
  let count = req.query.count || 5;
  let sort = req.query.sort;

  db.getReviews(product, page, count, sort, (err, dbResult) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send({
        product, page, count, results: dbResult
      });
    }
  });
})

app.get('/reviews/meta', (req, res) => {
  let product = req.query.product_id;

  db.getReviewsMetadata(product, (err, dbResult) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(dbResult[0]);
    }
  });
})

app.listen(3001, () => {
  console.log('back-end server listening on port 3001');
})