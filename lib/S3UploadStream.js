var S3_BUCKET = process.env.S3_BUCKET
var crypto = require('crypto');
var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION || 'eu-west-1';
var stream = require('stream')
var crypto = require('crypto');

S3UploadStream.prototype = Object.create(stream.Transform.prototype, {
    constructor: { value: S3UploadStream }
});

function S3UploadStream(options) {
    stream.Transform.call(this, options);
    this._bucket = new AWS.S3({params: {Bucket: S3_BUCKET}});
    this._data = ""
}
S3UploadStream.prototype._transform = function(chunk, encoding, done) {
    this._data = this._data + chunk.toString()
    done();
}
S3UploadStream.prototype._flush = function (done) {
    var shasum = crypto.createHash('sha1');
    var now = new Date().toISOString();
    shasum.update(this._data);
    var key = now.substring(0,10) + "-" + shasum.digest('hex') + ".js"

    var strm = this;
    this._bucket.putObject({Key: key, Body: this._data}, function(err, data) {
        if (err) {
            console.log(err);
            strm.emit("error", err)
        }
        strm.emit("s3uploadkey", key)
        done();
    });
}
module.exports = S3UploadStream
