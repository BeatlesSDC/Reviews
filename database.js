const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

var getReviews = (productID, page, count, sort, callback) => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
      return console.log(err);
    }
    var db = client.db('SDC');
    db.collection('reviews').find({ product_id: Number(productID) }).limit(Number(count)).toArray(callback);
  });
}

var getReviewsMetadata = (productID, callback) => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
      return console.log(err);
    }
    var db = client.db('SDC');
    db.collection('metadata').find({ _id: Number(productID) }).toArray(callback);
  });
}

var markReviewHelpful = (reviewID, callback) => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
      return console.log(err);
    }
    var db = client.db('SDC');
    db.collection('reviews').updateOne({ _id: Number(reviewID) }, { $inc: { helpfulness: 1 }}, callback);
  });
}

var reportReview = (reviewID, callback) => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
      return console.log(err);
    }
    var db = client.db('SDC');
    db.collection('reviews').find({ _id: Number(reviewID) }).forEach((doc) => {
      db.collection('reported').insertOne(doc);
    })
    .then(() => {
      return db.collection('reviews').deleteOne({ _id: Number(reviewID) });
    })
    .then(() => {
      callback(null);
    })
    .catch((err) => {
      callback(err);
    })
  });
}

module.exports = {
  getReviews,
  getReviewsMetadata,
  markReviewHelpful,
  reportReview
}