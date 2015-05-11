var aws = require('aws-sdk');
var s3 = new aws.S3({apiVersion: '2006-03-01'});
var dynamodb = new aws.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = function(event, context) {
   console.log('Received event from S3:');
   // Get the object from the event and show its content type
   var bucket = event.Records[0].s3.bucket.name;
   var key = event.Records[0].s3.object.key;
   var size = (event.Records[0].s3.object.size / 1024) + "kb";
   var eTag = event.Records[0].s3.object.eTag;
   console.log('File name=' + key);
   console.log('File size=' + size);
   console.log('File eTag=' + eTag);

   dynamodb.listTables(function(err, data) {
       if (err) {
           console.log("Unable to list DynamoDB tables! " + err);
       } else {
           console.log("Available DynamoDB tables: " + data.TableNames);
       }
   });

    var timestamp = new Date();
    var milliseconds = timestamp.getTime();
    // We must force the sending of the timestamp to DynamoDB as a string
    timestamp = timestamp.toString();
    milliseconds = milliseconds.toString();

    var params = {
        TableName: "insertNameOfYourDynamoDBTableHere",
        Item: {
            "requestDateTime":{"S":timestamp},
            "fromEpoch":{"N":milliseconds},
            "fileName":{"S":key},
            "fileSize":{"S":size}
        }
    };

    dynamodb.putItem(params, function(err, data) {
        if (err) {
            console.log("Error on putItem");
            console.log(err, err.stack);
            context.done('error','Error putting to DynamoDB' + err);
        } else {
            console.log("Successful putItem. Response returned from DynamoDB:");
            console.log(data);
            context.done(null,'filepickerLogging Function Complete');
        }
    });

};