const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log(err);
    return;
  }
  var db = client.db('reviews');

  // create metaData collection
  Promise.resolve(db.collection('RAWDATA_availableCharacteristics').find().forEach((doc) => db.collection('metaData').insertOne(doc)))

  // run this command in mongo terminal to create metaData documents with correct characteristics
  // db.metaData.aggregate([
  //   { $group : { _id: '$product_id', characteristics: { $push: '$name' }, ids: { $push: '$id' }}},
  //   { $out: 'metaDataMerged' }
  // ], { allowDiskUse: true })

  // check that the correct number of documents are in the metaData collection - compare the output from this to 'db.metaDataMerged.count({})' run in the terminal
  Promise.resolve(db.collection('RAWDATA_availableCharacteristics').distinct('product_id'))
  .then((res) => {
    console.log(res.length);
  })

  // add characteristic reviews to metadata documents
  db.collection('RAWDATA_characteristicReviews').createIndex({ characteristic_id: 1 });
  db.collection('RAWDATA_characteristicReviews').createIndex({ review_id: 1 });
  Promise.resolve(db.collection('metaDataMerged').find().forEach((doc) => {
    doc.characteristicReviews = {};
    Promise.resolve(doc.characteristics.forEach((characteristic, index) => {
      doc.characteristicReviews[characteristic] = [];
      db.collection('RAWDATA_characteristicReviews').find({ characteristic_id: doc.ids[index] }).forEach((characteristicReview) => {
        doc.characteristicReviews[characteristic].push(characteristicReview.value);
      });
    }))
    .then(() => {
      delete doc.characteristics;
      delete doc.ids;
      return db.collection('metaDataWithReviews').insertOne(doc);
    })
    .catch((err) => {
      console.log('error:', err);
    })
  }))
  .catch((err) => {
    console.log('error:', err);
  })

  // add rating and recommendation data to metadata documents
  db.collection('metaData').drop();
  db.collection('reviewsWithPhotos').createIndex({ product_id: 1 });
  Promise.resolve(db.collection('metaDataWithReviews').find().forEach((doc) => {
    doc.ratings = {};
    doc.recommended = {true: 0, false: 0};
    Promise.resolve(db.collection('reviewsWithPhotos').find({ product_id: doc._id }).forEach((review) => {
      if (doc.ratings[review.rating] === undefined) {
        doc.ratings[review.rating] = 1;
      } else {
        doc.ratings[review.rating] += 1;
      }
      if (review.recommend) {
        doc.recommended.true += 1;
      } else {
        doc.recommended.false += 1;
      }
    }))
    .then(() => {
      return db.collection('metaData').insertOne(doc);
    })
    .catch((err) => {
      console.log('error:', err);
    })
  }))
  .catch((err) => {
    console.log('error:', err);
  })
});