//all to be run in command line
use SDC

//to start keeping track of query info
db.getProfilingStatus()
db.getProfilingLevel()
db.setProfilingLevel(2)

//to clear system.profile
db.setProfilingLevel(0)
db.system.profile.drop()

//test queries
db.reviews.find().sort({_id:1}).limit(10).pretty()
db.reviews.find().sort({_id:-1}).limit(10).pretty()
db.reviews.updateOne({ _id: 5777928}, { $inc: { helpfulness: 1 }});
db.reviews.find(
  { product_id: 19096 }
).explain("executionStats")

//to get ten slowest queries
db.system.profile.find({"op" : {$eq:"query"}}, {
  "query" : NumberInt(1),
  "millis": NumberInt(1)
}).sort({millis:-1}).limit(10).pretty()