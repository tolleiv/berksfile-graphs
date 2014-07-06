var stream = require('stream')

LineStream.prototype = Object.create(stream.Transform.prototype, {
    constructor: { value: LineStream }
});

function LineStream() {
    stream.Transform.call(this, {objectMode: true });
    this._lastLineData = null;
}

LineStream.prototype._transform = function (chunk, encoding, done) {
    var data = chunk.toString()
    if (this._lastLineData) data = this._lastLineData + data

    var lines = data.split("\n")
    this._lastLineData = lines.splice(lines.length-1,1)[0]

    lines.forEach(this.push.bind(this))
    done()
}

LineStream.prototype._flush = function (done) {
    if (this._lastLineData) this.push(this._lastLineData)
    this._lastLineData = null
    done()
}

module.exports = LineStream