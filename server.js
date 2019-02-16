'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns=require("dns");

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended:false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// mongodb 
const urlSchema = mongoose.Schema({
  url : {type: String, required: true}
});

const UrlModel = mongoose.model("Url",urlSchema);

const timeout = 10000;

app.post("/api/shorturl/new", (req, res, next) => {
  let t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
  let postURL = new URL(req.body.url)
  dns.lookup(postURL.host, (err,address,family)=>{
    clearTimeout(t);
    if (err) {
      res.json({"error":"invalid URL"});
    }
    else {
      let url = new UrlModel({url: req.body.url})
      url.save((err,data)=>{
        if (!err) {
          res.json({original_url: data.url, short_url: data._id});
        }
      });
    }
  })
});

app.get("/api/shorturl/:id", (req, res, next) => {
  let t = setTimeout(()=> next({message: 'timeout'}), timeout);
  UrlModel.findById(req.params.id, (err,url) => {
    if (url) {
      res.redirect(url.url);
    }
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});
