##################
## First arg = AWS Lambda function name
## Second arg = JSON payload to provide as "event" structure to Lambda function
## Third arg = output results file (required by AWS CLI)
##################

#! /bin/bash

echo $1 $2 $3

aws lambda invoke --function-name $1 --payload $2 $3