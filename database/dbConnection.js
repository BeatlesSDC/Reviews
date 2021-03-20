const { MongoClient } = require('mongodb');
const url = "mongodb://localhost:27017";

var _db;

module.exports = {
  connect: (callback) => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true  }, (err, client) => {
      _db  = client.db('SDC');
      return callback(err);
    });
  },

  getDb: () => {
    return _db;
  }
};