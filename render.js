var stream = require('stream')

var liner = require('./lib/LineStream.js');
var parser = require('./lib/GraphStream.js');

// Pipe the streams
process.stdin
    .pipe(new liner())
    .pipe(new parser())
    .pipe(process.stdout);

// Some programs like `head` send an error on stdout
// when they don't want any more data
process.stdout.on('error', process.exit);
