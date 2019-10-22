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
client.get('search/tweets', {q: '#incident', lang: 'en', count: 100}, function(error, tweets, response) {
    console.log(tweets.statuses[0].text);
    //Get each tweet status, append the text and creation date to tweetData array in separate file
    for (let index = 0; index < tweets.statuses.length; index++) {
        const data = {
        text: tweets.statuses[index].text,
        created_at:tweets.statuses[index].created_at
        }
        test.push(data);
    }
});


var source = ['fire','melbourne'];

console.log(test.log);
//console.log(natural.LevenshteinDistance(source, test, {search: true}));



app.listen(5000, () => {
    console.log('Server listening on port: ', 5000);
});