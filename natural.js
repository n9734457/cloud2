const express = require('express');
const responseTime = require('response-time')
const axios = require('axios');
//const redis = require('redis');
const Twitter = require('twitter');
const http = require('http')
const path = require("path");
const exphbs = require('express-handlebars');
const tweetData = require('./TweetData');
var natural = require('natural');
const app = express();

console.log(tweetData);

//console.log(natural.LevenshteinDistance(source, target, {search: true}));



app.listen(5000, () => {
    console.log('Server listening on port: ', 5000);
});