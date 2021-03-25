//RUN FIRST

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log(err);
    return;
  }
  var db = client.db('SDC');

  // Create new collection where review documents use id from CSV as _id
  Promise.resolve(db.collection('RAWDATA_reviews').find().forEach((doc) => {
    doc._id = doc.id;
    db.collection('reviewsWithProperIDs').insertOne(doc);
  }))
  .then(() => {
    return db.collection('reviewsWithProperIDs').updateMany({}, { $unset: { 'id': 1 }});
  })
  .catch((err) => {
    console.log(err);
  })
  // //Pull photos into review documents (make sure review_id is indexed in reviewPhotos)
  .then(() => {
    return db.collection('RAWDATA_reviewPhotos').createIndex({ review_id: 1 });
  })
  .then(() => {
    Promise.resolve(db.collection('reviewsWithProperIDs').find().forEach((doc) => {
      doc.photos = [];
      Promise.resolve(db.collection('RAWDATA_reviewPhotos').find({ review_id: doc._id }).forEach((photoDoc) => {
        doc.photos.push(photoDoc.url);
      }))
      .then(() => {
        db.collection('reviews').insertOne(doc);
      })
      .catch((err) => {
        console.log(err);
      })
    }))
    .then(() => {
      console.log('finished');
    })
    .catch((err) => {
      console.log(err);
    });
  });
});

//db.reviewsWithProperIDs.drop()
//db.reviews.createIndex({helpfulness:1})
//db.reviews.createIndex({date:1})
