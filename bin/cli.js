#!/usr/bin/env node
var PouchDB = require('pouchdb')
var CircularJSON = require('circular-json')
var config = require('rc')('whoru', {
  couch: 'http://localhost:5984',
  db: 'whoru',
  seperator: '~',
  depth: 0
})
var db = new PouchDB(config.couch + '/' + config.db)
var whoru = require('whoru')(db)

var call = config._[0]
var args = config._.slice(1)
var cb = function (err, results) {
  if (err) return console.log('ERROR', err)
  console.log(CircularJSON.stringify(results))
}
args.push(cb)

if (call === 'init') {
  return require('whoru/lib/ddocs')(db, function (result) {
    console.log(result)
  })
}

if (call === 'similarFingerprints') {
  var str = String(args[0])
  var fp = str.split(config.seperator)
  var prefix = fp[0]
  for (var i = 1; i <= config.depth; i++) {
    if (fp[i]) prefix += (config.seperator + fp[i])
  }
  args[0] = prefix

}

whoru[call].apply(null, args)
