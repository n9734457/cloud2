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

var client = new Twitter({
    consumer_key: 'sxEwVBfoOYP0OT3WzUncMaVbf',
    consumer_secret: 'QRuxi60ycnYIdn8thFOiSGSzKivAtfQb0LU4q3XoPrVSs1FQLC',
    access_token_key: '1166624996682280963-pDGUHNoxasnGKnISsuOr2QXFVRoSDx',
    access_token_secret: 'P7jLDl5FnctOPsKdRz5j1wQRwx4bws7trMA2XrKPoieRK'
});

var test = [];

client.get('search/tweets', {q: 'incident', count: 200}, function(error, tweets, response) {
    for(i = 0; i < tweets.statuses.length;i++){ 
        var holder = { 
            created_at: tweets.statuses[i].created_at,
            text: tweets.statuses[i].text
        }
    test.push(holder); 
    var source = 'melbourne';
    console.log(test[i].text);
    console.log(natural.LevenshteinDistance(source, test[i].text, {search: true}));
    console.log('/n');
    }
 });


app.listen(5000, () => {
    console.log('Server listening on port: ', 5000);
});