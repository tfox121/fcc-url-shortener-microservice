'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here



mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
 
var UrlSchema = new Schema({
  id: Number,
  url: { type: String, required: true }
})

var ShortUrl = mongoose.model('ShortUrl', UrlSchema);

function handleAsync(err, data) {
  if (err) throw err;
  console.log(data)
}

var createAndSaveShortUrl = function (longUrl, done) {
  ShortUrl.findOne({url: longUrl}, function(err, data) {
    if(err) done(err)
    if(data) {
      console.log(`${longUrl} has already been entered`)
      done(null, data.id)
    } else {
      ShortUrl.countDocuments({}, function (err, count) {
        if(err) done(err)
        var url = new ShortUrl({
          id: count + 1,
          url: longUrl
        })
        url.save(function(err, data) {
          console.log("Saving")
          if (err) {
            done(err)
          } else {
            done(null, data.id)
          }
        })
      });
    }
  })
}

var findShortUrl = function (longUrl, done) {
  var short = 0
  ShortUrl.findOne({url: longUrl}, function(err, data) {
    if (err) {
      console.log("ERROR")
      done(err)
    } else {
      short = data.id
      console.log("PASS", short)
      done(null, short)
    }
  })
  return short
}


var removeManyUrls = function(done) {
  ShortUrl.remove({}, function(err, data) {
    err ? done(err) : done(null, data) 
  })
};

ShortUrl.countDocuments({}, function (err, count) {
  console.log('there are %d URLs', count);
});

var dns = require('dns')
var validUrl = require('valid-url');
var bodyParser = require('body-parser')

var parserMware = bodyParser.urlencoded({extended: false})

app.use(parserMware)

var REPLACE_REGEX = /^https?:\/\//i

app .route('/api/shorturl/new')
    .post(function(req, res) {
  var url = req.body.url
  var dehttp = url.replace(REPLACE_REGEX, '')
  dns.lookup(dehttp, async function (err, addresses, family) {
    if (err) {
      res.json({ "error": "invalid URL" })
    } else {
    function jsonAsync (err, data) {
      if (err) {
        throw err
      } else {
        console.log(url, "Short URL:", data)
        res.json({ original_url: url, short_url: data })
      }
    }
    createAndSaveShortUrl(url, jsonAsync)
 
    }
  });
  
  

  

  
  
  
})


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});