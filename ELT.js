const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log(err);
    return;
  }
  var db = client.db('reviews');

  //Create new collection where review documents use id from CSV as _id
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
  //Pull photos into review documents
  .then(() => {
    Promise.resolve(db.collection('reviewsWithProperIDs').find().forEach((doc) => {
      doc.photos = [];
      Promise.resolve(db.collection('RAWDATA_reviewPhotos').find({ review_id: doc._id }).forEach((photoDoc) => {
        doc.photos.push(photoDoc.url);
      }))
      .then(() => {
        db.collection('reviewsWithPhotos').insertOne(doc);
      })
      .catch((err) => {
        console.log('error1:');
        console.log(err);
      })
    }))
    .then(() => {
      console.log('finished');
    })
    .catch((err) => {
      console.log('error2:');
      console.log(err);
    })
  });
});
