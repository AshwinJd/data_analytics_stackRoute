# data_analytics_stackRoute
```
npm install
npm start
```

In the script to get data from dev server comment out the prod link and vice versa for using the prod link.

### For json to csv
Run the program using the following command.

```
node json2csv.js
```

### For transfer of data from mongo to Cassandra
```
node transferMtoC.js
```

## Installation of Cassandra
Go through the given link

http://cassandra.apache.org/download/

And ensure you have latest java installed in your system.

To check the version of Cassandra
```
cassandra -v
```

### To start Cassandra: -
1. sudo service cassandra start
2. cqlsh

if it throws error that cannot connect to the IP

### Check the status of cassandra
sudo /etc/init.d/cassandra status

### Check that if the port 9042 is being listen by java or not

```
netstat -tulpn
```
if not then your cassandra has not started

*if still it doesn't Work run this command*
```
export CQLSH_NO_BUNDLED=true
```
then you will have to install cassandra-driver
```
pip install cassandra-driver
```


*After it starts working*
run clqsh
```
cqlsh
```

cqlsh is similar to sql. Many of the commands in sql works in cqlsh also.

#### To create a new keyspace
```
CREATE KEYSPACE testkeyspace WITH replication = {'class':'SimpleStrategy','replication_factor':1};
```

#### check the keyspaces available
```
SELECT * FROM system.schema_keyspace;
```

#### Shift to the required keyspace
```
USE hobbes_prod;
```
This is the keyspace used in the code

Table Name is data

#### To display   the data
```
SELECT * FROM data;
```

## Merge Commit code

```
node commitMerge.js
```

This code will merge the commit history log from the commitUrl Api 'https://hobbes-insights.stackroute.in/api/commits?assignment=' to this Api add the submission Url present in the solutionRepoUrl of payload object in the json response coming from this api 'http://hobbes.stackroute.in/api/v1/facade/reports/evaluations/1498761000/?q=before&limit=391' .
