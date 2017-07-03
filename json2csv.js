const MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
const urlDb = 'mongodb://localhost:27017/analytics_Data';
const fs = require('fs');

//author Ashwin
// This function calls in the database from mongo and take each element and pass it to extract function
function convert(db) {
  var cursor = db.collection('documents').find();
  cursor.each(function(err,item){
    if(item == null) {
        cursor.toArray(function(err, item) {
            assert.equal(err , null);
            db.close();
          });
      }else{
        extract(item);
      }

  })
}

// to store the headers for the csv
let header = [];


//Author Ashwin
//Main function where conversion and write operations occur
function extract(item){

  let data = new Array (header.length);
  // since few documents dont have evalscores and their status is evalPending
  if(item['evalScores'] && header.length <= 0){
    Object.keys(item).map(function(key){
      if(key!='evalScores' && key!='payload'){
        header.push(key);
      }
      else if(key == 'evalScores'){
        Object.keys(item['evalScores']).map(function(evalTemp){
          if(evalTemp == 'sections'){
            item['evalScores']['sections'].map(function(element,index){
              header.push('evalScores_sections_'+element['name']+'_status');
              header.push('evalScores_sections_'+element['name']+'_total');
              header.push('evalScores_sections_'+element['name']+'_passes');
              header.push('evalScores_sections_'+element['name']+'_failed');
              header.push('evalScores_sections_'+element['name']+'_score');
            })
          }
          else{
            header.push('evalScores_finalScore');
          }
        })
      }
      else if (key == 'payload') {
        Object.keys(item['payload']).map(function(payTemp){
          header.push('payload_'+payTemp);
        })
      }
    })
    let headerTemp = header.toString() + '\n';
    fs.writeFile('file.csv', headerTemp , (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
    // console.log(header.length);
  }else {
      Object.keys(item).map(function(key){
      if(key!='evalScores' && key!='payload'){
        data[header.indexOf(key)] = item[key];
      }
      else if(key == 'evalScores'){
        Object.keys(item['evalScores']).map(function(evalTemp){
          if(evalTemp == 'sections'){
            item['evalScores']['sections'].map(function(element,index){
              data[header.indexOf('evalScores_sections_'+element['name']+'_status')] = item['evalScores']['sections'][index]['status'];
              data[header.indexOf('evalScores_sections_'+element['name']+'_total')] = item['evalScores']['sections'][index]['total'];
              data[header.indexOf('evalScores_sections_'+element['name']+'_passes')] = item['evalScores']['sections'][index]['passes'];
              data[header.indexOf('evalScores_sections_'+element['name']+'_failed')] = item['evalScores']['sections'][index]['failed'];
              data[header.indexOf('evalScores_sections_'+element['name']+'_score')] = item['evalScores']['sections'][index]['score'];
            })
          }
          else{
            data[header.indexOf('evalScores_finalScore')] = item['evalScores']['finalScore'];
          }
        })
      }
      else if (key == 'payload') {
        Object.keys(item['payload']).map(function(payTemp){
          data[header.indexOf('payload_solutionRepoUrl')] = item['payload']['solutionRepoUrl'];
        })
      }
    })
    // console.log(data.toString());
    let dataTemp = data.toString() + '\n';
    fs.appendFile('file.csv', dataTemp, (err) => {
      if (err) throw err;
      // console.log('The file has been saved!');
    });

  }
}


//Using the MongoClient module we have connected to the database
MongoClient.connect(urlDb,(err, db)=>{
  assert.equal(null,err);
  console.log('Connected to the database');
  convert(db);
});
