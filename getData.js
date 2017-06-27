const http = require('http');
const request = require('ajax-request');
const MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

//author: Ashwin Jayadev
//api url with limit which is actually the no. of collections in the db at the particular timestamp
let URL = 'https://internal.stackroute.in/api/v1/facade/reports/evaluations/1498674600/?q=before&limit=179';

// database name is analytics_Data
const urlDb = 'mongodb://localhost:27017/analytics_Data';

//author : Ashwin Jayadev
// ajax request used to for get request

request(URL, function(err, res, body) {});

var insertDocuments = function(db, callback) {
  let json;
  request({
    url: URL,
    method: 'GET',
   }, function(err, res, body) {
    // json will have the entire collection in the form of array of objects
    json = JSON.parse(body)["evaluations"];
    // console.log(json);
    var collection = db.collection('documents');
    // Insert some documents
    // console.log(json);
    collection.insert(json, function(err, result) {
      assert.equal(err, null);
      // assert.equal(3, result.result.n);
      // assert.equal(3, result.ops.length);
      console.log("Inserted 3 documents into the document collection");
      callback(result);
    });


  });
  // Get the documents collection
  }

//author: Ashwin Jayadev
// Connection URL
// Use connect method to connect to the Server
MongoClient.connect(urlDb, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");
  insertDocuments(db, function() {
    db.close();
  });
});
