// REFERENCES:
// DATASTORE + FUNCTIONS example
//	- https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/functions/datastore/index.js
//  - https://cloud.google.com/functions/docs/tutorials/imagemagick

const {Storage} = require('@google-cloud/storage');
const axios = require('axios');

function generateHash() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 *
 * @param hash
 * @param {ArrayBuffer} data
 * @return {Promise<void>}
 */
async function saveFile(hash, data) {
    const storage = new Storage();
    const file = await storage
        .bucket('serverless-image-processor.appspot.com')
        .file("/images/" + hash + ".jpg");

    try {
        // Options available: https://cloud.google.com/nodejs/docs/reference/storage/2.0.x/File#createWriteStream
        await file.save(data, {'public': true});
        console.log(`File "${hash}" saved successfully`);
        console.log('File stats:' + JSON.stringify(await file.getMetadata()));
    } catch (e) {
        console.log('File NOT saved successfully');
        throw e;
    }
}


async function downloadFile(url) {
    return await axios({
        url: url,
        method: 'GET',
        responseType: 'blob',
    });
}


/**
 * Responds to any HTTP request that can provide a "message" field in the body.
 *
 * @param {!Object} req Cloud Function request context.
 * @param {!Object} res Cloud Function response context.
 */
async function helloWorld(req, res) {
    try {

        // const util = require('util');
        // console.log(JSON.stringify(Object.keys(req)));
        // res.status(200).send(JSON.stringify(Object.keys(req)));


        // Executed on every request for test purpose
        const response = await downloadFile("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg");
        await saveFile(generateHash(), response.data);
        console.log('HTTP Code 200 sent');
        res.status(200).send("File written successfully");
    } catch (e) {
        console.log('HTTP Code 400 sent');
        res.status(400).send(
            {
                'datetime': (new Date()).toISOString(),
                'name': e.name,
                'error': e.message,
                'fileName': e.fileName,
                'lineNumber': e.lineNumber,
            }
        );
    }
}

exports.helloWorld = helloWorld;
