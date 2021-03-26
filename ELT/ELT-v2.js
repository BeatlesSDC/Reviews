const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log(err);
    return;
  }
  var db = client.db('SDC');
  console.log('start time:', new Date());
  db.collection('RAWDATA_reviewPhotos').createIndex({ review_id: 1 })
  .then(() => {
    return db.collection('RAWDATA_reviews').aggregate([
      // { $match: { id: 1 } },
      { $project: {
          review_id: "$id",
          product_id: 1,
          rating: 1,
          date: 1,
          summary: 1,
          body: 1,
          recommend: 1,
          reported: 1,
          reviewer_name: 1,
          reviewer_email: 1,
          response: 1,
          helpfulness: 1
      } },
      { $lookup: {
          from: "RAWDATA_reviewPhotos",
          localField: "review_id",
          foreignField: "review_id",
          as: "photos"
      } },
      { $unwind: { path: "$photos", preserveNullAndEmptyArrays: true } },
      { $group: {
          _id: "$_id",
          review_id: { $first: "$review_id" },
          product_id: { $first: "$product_id" },
          rating: { $first: "$rating" },
          date: { $first: "$date" },
          summary: { $first: "$summary" },
          body: { $first: "$body" },
          recommend: { $first: "$recommend" },
          reported: { $first: "$reported" },
          reviewer_name: { $first: "$reviewer_name" },
          reviewer_email: { $first: "$reviewer_email" },
          response: { $first: "$response" },
          helpfulness: { $first: "$helpfulness" },
          photos: { "$push": "$photos.url" }
      } },
      { $out: "reviews" }
    ], { allowDiskUse: true }).toArray()
  })
  .then(() => {
    return db.collection('reviews').createIndex({ helpfulness: 1 })
  })
  .then(() => {
    return db.collection('reviews').createIndex({ date: 1 })
  })
  .then(() => {
    return db.collection('reviews').createIndex({ reported: 1 })
  })
  .then(() => {
    return db.collection('reviews').aggregate([
      { $match : { $or: [{ reported: 'true' }, { reported: 1 }] }},
      { $out: 'reviews_reported' }
    ], { allowDiskUse: true }).toArray()
  })
  .then(() => {
    return db.collection('reviews').aggregate([
      { $match : { $or: [{ reported: 'false' }, { reported: 0 }] }},
      { $out: 'reviews_notReported' }
    ], { allowDiskUse: true }).toArray()
  })
  // .then(() => {
  //   console.log('end of creating review collections - time:', new Date())
  // })
  // .then(() => {
  //   return db.collection('RAWDATA_characteristicReviews').createIndex({ characteristic_id: 1 })
  // })
  // .then(() => {
  //   return db.collection('RAWDATA_reviews').createIndex({ review_id: 1 })
  // })
  // .then(() => {
  //   return db.collection('RAWDATA_characteristicReviews').aggregate([
  //     { $match: { characteristic_id: { $lt: 10 } } },
  //     { $lookup: {
  //       from: "RAWDATA_reviews",
  //       localField: "review_id",
  //       foreignField: "id",
  //       as: "review"
  //     } },
  //     { $group : {
  //       _id: '$characteristic_id',
  //       product_id: { $first: '$review.product_id' },
  //       reviews: { $push: '$value' }
  //     } },
  //     { $unwind: { path: "$product_id" } },
  //     { $lookup: {
  //       from: "RAWDATA_availableCharacteristics",
  //       localField: "_id",
  //       foreignField: "id",
  //       as: "charDetails"
  //     } },
  //     { $project: {
  //       product_id: 1,
  //       reviews: 1,
  //       name: "$charDetails.name"
  //     } },
  //     { $unwind: { path: "$name" } },
  //     { $group : {
  //       _id: '$product_id',
  //       characteristics: { $push: {
  //         k: '$name',
  //         v: '$reviews',
  //       }}
  //     } },
  //     { $project: {
  //       _id: 1,
  //       characteristics: { $arrayToObject: '$characteristics' }
  //     } },
  //     { $lookup: {
  //       from: "RAWDATA_reviews",
  //       localField: "_id",
  //       foreignField: "product_id",
  //       as: "reviews"
  //     } },
  //     { $unwind: { path: "$reviews" } },
  //     { $group : {
  //       _id: '$_id',
  //       ratings: { $push: '$reviews.rating' },
  //       recommended: { $push: '$reviews.recommend' },
  //       characteristics: { $first: '$characteristics' }
  //     } },
  //     { $out: 'metadata' }
  //   ], { allowDiskUse: true }).toArray()
  // })
  .then(() => {
    console.log('end time:', new Date())
    client.close();
  })
  .catch((err) => {
    console.log('error:', err);
    client.close();
  })
});
