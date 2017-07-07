const MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
const request = require('superagent');
const async = require('async');

const urlDb = 'mongodb://localhost:27017/analytics_Data';
let URL_prod = 'http://hobbes.stackroute.in/api/v1/facade/reports/evaluations/1498761000/?q=before&limit=391';
let commitUrl = 'https://hobbes-insights.stackroute.in/api/commits?assignment=';
let json;

//author Ashwin Jayadev
//This function gets all the data as json response from the hobbes prod url
function getData(db,callback){

  request
    .get(URL_prod)
    .end((err,res)=>{
      if(err){
        callback(err,null);
        return;
      }
      // console.log(res.body);
      json = res.body['evaluations'];
      console.log('Successfully Recieved the data from the server!!!');
      callback(null,json,db);
    });
}


//Author Ashwin Jayadev
/* This Function gets all the previous commit data from the solutionRepoUrl of payload object
 * present in each object of the data from the response
 * recieved from the getData function and passed it to the commitUrl api, which
 * responds by giving an array of previous commits and is then pushed to the
 * mongoDb.
*/
function getCommits(json,db,callback){
  let gitUrl;
  let collection = db.collection('productionData');

  async.mapSeries(json,function(data,cb){
    gitUrl = encodeURIComponent(data['payload']['solutionRepoUrl']);
    request
      .get(commitUrl+gitUrl)
      .end((err,res)=>{
        if(err){
          cb(null,{error: err});
          // console.log(err);
          data['commits'] = 'notfound';
          collection.insertOne(data);// Few repourl doesnt give any response because those projects might have been deleted
          return;
        }else{
          data['commits']=res.body;
          collection.insertOne(data);// MongoClient function to insert into the collection
          cb(null,data);
        }
      })
  },function(err,result){
      console.log('Successfully got all the commit data!!!');
      callback(null,result);
  });
}

//author Ashwin Jayadev
//asynWaterfall function is applied to execute getData and getCommits functions
function mainFunction(db,callback){
  async.waterfall([
    getData.bind(null, db), //binded db object
    getCommits,
  ],function(err,result){
    if(err){
      // console.error(err);
      callback();
      return;
    }
    console.log('Successfully pushed to Mongo!!!');
    callback();
  });
}

MongoClient.connect(urlDb,(err,db)=>{
  assert.equal(null,err);
  console.log('Connected to database');
  mainFunction(db,function(){
    db.close();
  });
});
