const cassandra = require('cassandra-driver');
const MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
const urlDb = 'mongodb://localhost:27017/analytics_Data';

const query = "insert into data(id,statusUpdateOn,repoReftype,repoRef,repoUrl,submissionId,username,"+
        "evalScores_sections_cadetTests_status,evalScores_sections_cadetTests_total,"+
        "evalScores_sections_cadetTests_passes,evalScores_sections_cadetTests_failed,"+
        "evalScores_sections_cadetTests_score,evalScores_sections_commanderTests_status,"+
        "evalScores_sections_commanderTests_total,evalScores_sections_commanderTests_passes,"+
        "evalScores_sections_commanderTests_failed,evalScores_sections_commanderTests_score,"+
        "evalScores_sections_eslint_status,evalScores_sections_eslint_total,evalScores_sections_eslint_passes,"+
        "evalScores_sections_eslint_failed,evalScores_sections_eslint_score,evalScores_sections_htmlhint_status,"+
        "evalScores_sections_htmlhint_total,evalScores_sections_htmlhint_passes,"+
        "evalScores_sections_htmlhint_failed,evalScores_sections_htmlhint_score,"+
        "evalScores_sections_smells_status,evalScores_sections_smells_total,evalScores_sections_smells_passes,"+
        "evalScores_sections_smells_failed,evalScores_sections_smells_score,"+
        "evalScores_sections_phantomTests_status,evalScores_sections_phantomTests_total,"+
        "evalScores_sections_phantomTests_passes,evalScores_sections_phantomTests_failed,"+
        "evalScores_sections_phantomTests_score,evalScores_finalScore,payload_solutionRepoUrl,"+
        "status,submittedOn) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";


const client = new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: 'hobbes_prod' });


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

    data[0] = data[0].toString(); // the first entry is the Id which is in the form Object, hence converted to String
    
    //author Ashwin Jayadev
    // insertion code to cassandra
    client.execute(query,data,{ prepare : true },(err,result)=>{
    if(err) throw err;
    })
    
  }
}


//Using the MongoClient module we have connected to the database
MongoClient.connect(urlDb,(err, db)=>{
  assert.equal(null,err);
  console.log('Connected to the database');
  convert(db);
  // client.shutdown();

});
