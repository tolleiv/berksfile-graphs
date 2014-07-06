var stream = require('stream')

GraphStream.prototype = Object.create(stream.Transform.prototype, {
    constructor: { value: GraphStream }
});

function GraphStream() {
    stream.Transform.call(this, {objectMode: true });
    this.nonCommunityCookbooks = []
    this.sourceCookbook = null;
    this.body = false;
    this.prevCookbook = null;
    this.cookbookIdx = 0;
    this.cookbookIdMap = {}
    this.cookbookLinkMap = []
}

GraphStream.prototype.addCookbook = function(name) {
    if (!this.cookbookIdMap.hasOwnProperty(name)) {
        this.cookbookIdMap[name] = this.cookbookIdx++;
    }
}
GraphStream.prototype.linkCookbooks = function(source, target) {
    this.cookbookLinkMap.push({
        source: this.cookbookIdMap[source],
        target: this.cookbookIdMap[target],
        value: 1
    })
}
GraphStream.prototype.cookbookGroup = function(name) {
    var grp = 1;
    if (this.nonCommunityCookbooks.indexOf(name) === -1) {
        grp = 2;
    } else if (name.search(/^aoe_/) != -1) {
        grp = 3;
    }
    return grp;
}
GraphStream.prototype._transform = function(data, encoding, done) {
    var s = data.toString(encoding)

	// weak way to avoid further body parser plugsin
    if (s.search(/^------/) != -1) return done();
    
    if (!this.body) {
        if (s.search(/^GRAPH/) != -1) {
            this.body = true;
        } else {
            if (s.search(/^\s{4}\S+/) != -1) {
                this.nonCommunityCookbooks.push(this.prevCookbook)
            } else {
                this.prevCookbook = s.replace(/^\s+(\S+)\s*$/,'$1')
            }
        }
    } else {
        var cookbook = s.replace(/^\s+(\S+).*$/, '$1')
        this.addCookbook(cookbook);
        if (s.search(/^\s{2}\S+/g) != -1) {
            this.sourceCookbook = cookbook;
        } else if (this.sourceCookbook) {
            this.linkCookbooks(cookbook, this.sourceCookbook)
        }
    }
    done();
}
GraphStream.prototype._flush = function (done) {
    var result = { nodes: [], links: this.cookbookLinkMap }
    for (var key in this.cookbookIdMap) {
        result.nodes.push({
            name: key,
            group: this.cookbookGroup(key)
        })
    }
    this.push(JSON.stringify(result))
    done()
}


module.exports = GraphStream;
