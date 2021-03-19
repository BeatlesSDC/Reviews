//RUN LAST

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log(err);
    return;
  }
  var db = client.db('SDC');

  // Create new collection containing reported reviews
  db.collection('reviews').createIndex({ reported: 1 })
  .then(() => {
    return db.collection('reviews').aggregate([
      { $match : { $or: [{ reported: 'true' }, { reported: 1 }] }},
      { $out: 'reported' }
    ], { allowDiskUse: true }).toArray()
  })
  // Delete reported reviews from reviews collection so that get requests don't include them
  .then(() => {
    db.collection('reviews').deleteMany({ reported: 'true' })
  })
  .then(() => {
    db.collection('reviews').deleteMany({ reported: 1 })
  })
  .catch((err) => {
    console.log(err);
  })
});