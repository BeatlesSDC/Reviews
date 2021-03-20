const connection = require('./dbConnection');

var getReviews = (productID, page, count, sort, callback) => {
  connection.getDb().collection('reviews').find({ product_id: Number(productID) }).limit(Number(count)).toArray(callback);
}

var getReviewsMetadata = (productID, callback) => {
  connection.getDb().collection('metadata').find({ _id: Number(productID) }).toArray(callback);
}

var markReviewHelpful = (reviewID, callback) => {
  connection.getDb().collection('reviews').updateOne({ _id: Number(reviewID) }, { $inc: { helpfulness: 1 }}, callback);
}

var reportReview = (reviewID, callback) => {
  connection.getDb().collection('reviews').find({ _id: Number(reviewID) }).forEach((doc) => {
    connection.getDb().collection('reported').insertOne(doc);
  })
  .then(() => {
    return connection.getDb().collection('reviews').deleteOne({ _id: Number(reviewID) });
  })
  .then(() => {
    callback(null);
  })
  .catch((err) => {
    callback(err);
  })
}

var addReview = (reviewID, callback) => {
  connection.getDb().collection('reviews').find({ _id: Number(reviewID) }).forEach((doc) => {
    connection.getDb().collection('reported').insertOne(doc);
  })
  .then(() => {
    return connection.getDb().collection('reviews').deleteOne({ _id: Number(reviewID) });
  })
  .then(() => {
    callback(null);
  })
  .catch((err) => {
    callback(err);
  })
}

module.exports = {
  getReviews,
  getReviewsMetadata,
  markReviewHelpful,
  reportReview,
  addReview
}