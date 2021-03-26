var mongo = require('mongodb');
const connection = require('./dbConnection');

var getReviews = (productID, page, count, sort, callback) => {
  if (sort === 'newest') {
    connection.getDb().collection('reviews_notReported').find({ product_id: Number(productID) }).sort({date: -1}).skip((page - 1) * count).limit(Number(count)).toArray(callback);
  } else  if (sort === 'helpful') {
    connection.getDb().collection('reviews_notReported').find({ product_id: Number(productID) }).sort({helpfulness: -1}).skip((page - 1) * count).limit(Number(count)).toArray(callback);
  } else  if (sort === 'relevant') {
    connection.getDb().collection('reviews_notReported').find({ product_id: Number(productID) }).sort({helpfulness: -1, date: -1}).skip((page - 1) * count).limit(Number(count)).toArray(callback);
  } else {
    connection.getDb().collection('reviews_notReported').find({ product_id: Number(productID) }).skip((page - 1) * count).limit(Number(count)).toArray(callback);
  }
}

var getReviewsMetadata = (productID, callback) => {
  connection.getDb().collection('metadata').find({ _id: Number(productID) }).toArray(callback);
}

var markReviewHelpful = (ID, callback) => {
  var o_id = new mongo.ObjectID(ID);
  connection.getDb().collection('reviews_notReported').updateOne({ _id: o_id }, { $inc: { helpfulness: 1 }}, callback);
}

var reportReview = (ID, callback) => {
  var o_id = new mongo.ObjectID(ID);
  connection.getDb().collection('reviews_notReported').find({ _id: o_id }).forEach((doc) => {
    doc.reported = 1;
    connection.getDb().collection('reviews_reported').insertOne(doc);
  })
  .then(() => {
    return connection.getDb().collection('reviews_notReported').deleteOne({ _id: o_id });
  })
  .then(() => {
    callback(null);
  })
  .catch((err) => {
    callback(err);
  })
}

var addReview = (data, callback) => {
  let { summary, body, photos } = data;
  let recommend = Number(data.recommend);
  let product_id = Number(data.product_id);
  let rating = Number(data.rating);
  let reviewer_email = data.email;
  let reviewer_name = data.name;
  let date = new Date().toISOString().split('T')[0];
  connection.getDb().collection('reviews_notReported').insertOne({ product_id, rating, summary, body, recommend, reviewer_name, reviewer_email, photos, date, helpfulness: 0, response: null, reported: 0 })
  .then(() => {
    return connection.getDb().collection('metadata').find({ _id: Number(product_id) }).forEach((doc) => {
      let { characteristicReviews, recommended, ratings } = doc;
      for (var characteristic in doc.characteristicReviews) {
        characteristicReviews[characteristic].push(Number(data.characteristics[characteristic]));
      }
      if (typeof recommend === 'string') {
        recommended[recommend]++;
      } else {
        recommended[Boolean(recommend)]++;
      }
      if (ratings[rating] === undefined) {
        ratings[rating] = 1;
      } else {
        ratings[rating]++;
      }
      return connection.getDb().collection('metadata').updateOne(
        { _id: Number(product_id) },
        { $set: { characteristicReviews, recommended, ratings }}
      );
    })
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