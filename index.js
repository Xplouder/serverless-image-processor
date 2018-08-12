// REFERENCES:
// DATASTORE + FUNSTIONS example
//	- https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/functions/datastore/index.js
//  - https://cloud.google.com/functions/docs/tutorials/imagemagick

var storage = require('@google-cloud/storage')();
var myBucket = storage.bucket('serverless-image-processor.appspot.com');
var Stream = require('stream').Transform;

var http = require('http');
var fs = require('fs');

var download = function(url, cb) {
    var hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('Starting download file ' + hash);
    var request = http.get(url, function(response) {

        var data = new Stream();

        response.on('data', function(chunk) {
            console.log('Chunk received');
            data.push(chunk);
        });

        response.on('end', function () {
            console.log('Download ended');
            var file = myBucket.file("/images/" + hash + ".jpg");
            file.save(data.read(), {}, function(err) {
                if (!err) {
                    console.log('File saved successfully');
                    cb();
                    console.log('File stats:');
                    file.makePublic();
                    return;
                }
                cb('File NOT written successfully: ' + err);
                console.log('File NOT saved successfully');
            });
        });

    });
}



/*storage.save(entity).then(function () {

  var hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  var file = fs.createWriteStream("/images/" + hash + ".jpg");
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);
    });
  });


  return res.status(200).send("Entity ".concat(key.path.join('/'), " saved."));
}).catch(function (err) {
  console.error(err);
  return Promise.reject(err);
});*/




/**
 * Responds to any HTTP request that can provide a "message" field in the body.
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */
exports.helloWorld = (req, res) => {

    // Executed on every requst for test purpose
    download("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", function (errorMessage){
        if(errorMessage){
            console.log('HTTP Code 400 sent');
            res.status(400).send(errorMessage);
            return;
        }
        console.log('HTTP Code 200 sent');
        res.status(200).send("File written successfully");
    });

    // Example input: {"message": "Hello!"}
    /*if (req.body.message === undefined) {
      // This is an error case, as "message" is required.
      res.status(400).send('No message defined!');
    } else {
      // Everything is okay.
      console.log(req.body.message);
      res.status(200).send('Success: ' + req.body.message);
    }*/
};
