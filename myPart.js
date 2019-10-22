const express = require('express');
const responseTime = require('response-time')
const axios = require('axios');
//const redis = require('redis');
const Twitter = require('twitter');
const http = require('http')
const path = require("path");
const exphbs = require('express-handlebars');
const tweetData = require('./TweetData');
const app = express();

//
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');


//Twitter api connection Token 
var client = new Twitter({
    consumer_key: 'sxEwVBfoOYP0OT3WzUncMaVbf',
    consumer_secret: 'QRuxi60ycnYIdn8thFOiSGSzKivAtfQb0LU4q3XoPrVSs1FQLC',
    access_token_key: '1166624996682280963-pDGUHNoxasnGKnISsuOr2QXFVRoSDx',
    access_token_secret: 'P7jLDl5FnctOPsKdRz5j1wQRwx4bws7trMA2XrKPoieRK'
});


var test =[];

client.get('search/tweets', {q: 'incident', count: 100}, function(error, tweets, response) {
    console.log(tweets.statuses.length);
    for(i = 0; i < tweets.statuses.length;i++){ 
        var holder = {
            created_at: tweets.statuses[i].created_at,
            text: tweets.statuses[i].text
        }
    tweetData.push(holder); 
    }
    console.log(tweetData);
 });

app.listen(3000, () => {
    console.log('Server listening on port: ', 3000);
});