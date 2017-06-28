const http = require('http');
const MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
const request = require('superagent');

//author: Ashwin Jayadev
//api url with limit which is actually the no. of collections in the db at the particular timestamp
//Two urls URL_dev and URL_prod one for the development and pther production

// let URL_dev = 'http://internal.stackroute.in/api/v1/facade/reports/evaluations/1498761000/?q=before&limit=179';
let URL_prod = 'http://hobbes.stackroute.in/api/v1/facade/reports/evaluations/1498761000/?q=before&limit=391';

// database name is analytics_Data
const urlDb = 'mongodb://localhost:27017/analytics_Data';

//author : Ashwin Jayadev
// superagent request used to for get request

var insertDocuments = function(db, callback) {

    let json;
    request
      .get(URL_prod)
      .end((err,res)=>{
        if(err) throw err;
        json = res.body["evaluations"];


        //  collection name is documents
        let collection = db.collection('documents');
        // Insert some documents
        collection.insert(json, function(err, result) {
          assert.equal(err, null);
          // assert.equal(3, result.result.n);
          // assert.equal(3, result.ops.length);
          console.log("Inserted documents into the document collection");
          callback(result);
        });
        // console.log(json);
      })

    // console.log(json);
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
