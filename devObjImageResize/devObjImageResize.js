// Dependencies
var async = require('async');
var AWS = require('aws-sdk');
var gm = require('gm').subClass({ imageMagick: true }); // Use ImageMagick integration.

// Image resize constants
var MAX_WIDTH  = 150;
var MAX_HEIGHT = 150;

// get reference to S3 client
var s3 = new AWS.S3();

exports.handler = function(event, context) {

	var srcBucket = event.Records[0].s3.bucket.name;
	var srcKey    = event.Records[0].s3.object.key;
	var dstBucket = "devobjfinishedimages";
	var dstKey    = "thumb-" + srcKey;

	// Source and destination buckets cannot be the same in processing S3 events in Lambda.
	if (srcBucket == dstBucket) {
		console.error("Destination bucket must not match source bucket.");
		return;
	}

	// Make sure that we are processing either a JPG or PNG file.
	var typeMatch = srcKey.match(/\.([^.]*)$/);
	if (!typeMatch) {
		console.error('Unable to infer image type for key ' + srcKey);
		return;
	}
	var imageType = typeMatch[1];
	if (imageType != "jpg" && imageType != "png") {
		console.log('Skipping non-image: ' + srcKey);
		return;
	}

	// Use async to ensure that each step occurs in sequence.
	async.waterfall([
		// First download the image from S3 (it's not sent in the event) into memory
		function download(next) {
			console.log("Getting source image from S3.");
			s3.getObject({
					Bucket: srcBucket,
					Key: srcKey
				},
				next);
			},
		// Resize the image. Response is the image data as downloaded from S3.
		function tranform(response, next) {
			console.log("Resizing source image.");
			gm(response.Body).size(function(err, size) {
				var scalingFactor = Math.min(
					MAX_WIDTH / size.width,
					MAX_HEIGHT / size.height
				);
				var width  = scalingFactor * size.width;
				var height = scalingFactor * size.height;

				// Transform the image buffer in memory. Resize, remove EXIF data, add a border.
				this.resize(width, height)
					.noProfile()
					.frame(2,2,1,1)
					.toBuffer(imageType, function(err, buffer) {
						if (err) {
							next(err);
						} else {
							next(null, response.ContentType, buffer);
						}
					});
			});
		},
		// Put the thumbnail, now in memory, back in the S3 destination bucket with the new file name.
		function upload(contentType, data, next) {
			console.log("Uploading thumbnail to S3.");
			s3.putObject({
					Bucket: dstBucket,
					Key: dstKey,
					Body: data,
					ContentType: contentType
				},
				next);
			}
		], function (err) {
			if (err) {
				console.error(
					'Unable to process ' + srcBucket + '/' + srcKey +
					' due to an error: ' + err
				);
			} else {
				console.log(
					'Successfully resized ' + srcBucket + '/' + srcKey +
					' and uploaded to ' + dstBucket + '/' + dstKey
				);
			}

			context.done();
		}
	);
};