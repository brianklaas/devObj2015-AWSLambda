# Code Samples from devObj2015: AWS Lambda
Code samples from my dev.Objective() 2015 presentation "Node.js Without Servers: Event-Driven Computing with AWS Lambda."

Samples should be ready to run if you add them to Lambda.

devObjCustomEvent.js and filePickerLogging.js run as code created inside the Lambda AWS Management Console.

The devObjImageResize code samples require appropriately named buckets on S3 in addition to uploading ZIP files with the code to each Lambda function. Remember that you want to zip the .js and the node_modules folders to create the zip, not the folder which contains the .js file and node_modules folder.

devObjImageResizeSNS and devObjImageResizeSQS require that you create a SNS topic and SQS queue, respectively, for those to work.
