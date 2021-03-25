const connection = require('./dbConnection');

var getReviews = (productID, page, count, sort, callback) => {
  if (sort === 'newest') {
    connection.getDb().collection('reviews').find({ product_id: Number(productID) }).sort({date: -1}).skip((page - 1) * count).limit(Number(count)).toArray(callback);
  } else  if (sort === 'helpful') {
    connection.getDb().collection('reviews').find({ product_id: Number(productID) }).sort({helpfulness: -1}).skip((page - 1) * count).limit(Number(count)).toArray(callback);
  } else  if (sort === 'relevant') {
    connection.getDb().collection('reviews').find({ product_id: Number(productID) }).sort({helpfulness: -1, date: -1}).skip((page - 1) * count).limit(Number(count)).toArray(callback);
  } else {
    connection.getDb().collection('reviews').find({ product_id: Number(productID) }).skip((page - 1) * count).limit(Number(count)).toArray(callback);
  }
}

var getReviewsMetadata = (productID, callback) => {
  connection.getDb().collection('metadata').find({ _id: Number(productID) }).toArray(callback);
}

var markReviewHelpful = (reviewID, callback) => {
  connection.getDb().collection('reviews').updateOne({ _id: Number(reviewID) }, { $inc: { helpfulness: 1 }}, callback);
}

var reportReview = (reviewID, callback) => {
  connection.getDb().collection('reviews').find({ _id: Number(reviewID) }).forEach((doc) => {
    doc.reported = 1;
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

var addReview = (data, callback) => {
  let { summary, body, photos } = data;
  let recommend = Number(data.recommend);
  let product_id = Number(data.product_id);
  let rating = Number(data.rating);
  let reviewer_email = data.email;
  let reviewer_name = data.name;
  let date = new Date().toISOString().split('T')[0];
  var id;
  connection.getDb().collection('counter').updateOne(
    { _id: 'id' },
    { $inc: { num: 1 }}
  )
  .then(() => {
    connection.getDb().collection('counter').find().forEach((doc) => {
      connection.getDb().collection('reviews').insertOne({ _id: doc.num, product_id, rating, summary, body, recommend, reviewer_name, reviewer_email, photos, date, helpfulness: 0, response: null, reported: 0 })
      .then(() => {
        connection.getDb().collection('metadata').find({ _id: Number(product_id) }).forEach((doc) => {
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