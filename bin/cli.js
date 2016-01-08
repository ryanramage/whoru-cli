#!/usr/bin/env node
if (process.argv.indexOf('--compgen') != -1) {
  var complete = require('complete');
  complete({
    program: 'whoru',
    commands: {
      'addFingerprint': {},
      'addLogin': {},
      'findPerson': {},
      'getPerson': {},
      'mergePerson': {},
      'similarFingerprints': {}
    },
    options: {
      '--couch': {},
      '--db': {}
    }
  })
  complete.init()
  process.exit(0)
}

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


// check params, and output help message if not enough
if (!call) {
  return console.log('Usage: whoru <command>')
}
if (call === 'addFingerprint' && args.length !== 1) {
  console.log('No fingerprint specified, try:')
  return console.log('whoru addFingerprint <fingerprint>')
}
if (call === 'addLogin' && args.length !== 5) {
  console.log('addLogin requires 5 parameters, try:')
  return console.log('whoru addLogin <fingerprint> <userloginID> <loginType> <app> <space>')
}
if (call === 'findPerson' && args.length !== 3) {
  console.log('findPerson requires 3 parameters, try:')
  return console.log('whoru findPerson <fingerprint> <app> <space>')
}
if (call === 'findDetails') {
  return console.log('findDetails is not available on the cli')
}
if (call === 'mergePerson' && args.length !== 2) {
  console.log('mergePerson requires 2 parameters, try:')
  return console.log('whoru findPerson <from_person_id> <to_person_id>')
}
if (call === 'getPerson' && args.length !== 1) {
  console.log('getPerson requires 1 parameters, try:')
  return console.log('whoru getPerson <person_id>')
}
if (call === 'similarFingerprints' && args.length !== 1) {
  console.log('similarFingerprints requires 1 parameters, try:')
  return console.log('whoru similarFingerprints <fingerprint>')
}

var cb = function (err, results) {
  if (err) return console.log('ERROR', err)
  try {
    console.log(JSON.stringify(results))
  } catch (e) {
    // fallback
    console.log(CircularJSON.stringify(results))
  }

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
