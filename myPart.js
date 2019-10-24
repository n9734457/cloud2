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

//
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');


//Twitter api connection Token 
var client = new Twitter({
    consumer_key: 'GKoc8IOfNWguBDG4ZqcXDLj0Q',
    consumer_secret: 'qdNx8GJvTzLMfDiv1fPMj8onhItucpjHYRgyKty5itnaiotDnG',
    access_token_key: '1166624996682280963-YBysjVrHljKDoH5Pvl1ZQtaGEhZkDs',
    access_token_secret: 'WIQ9M6l7rnUpPwk18F06xQsAUBJfzlGmqzZBcNuSZxe9A'
});


var word1 =[];
var word2= [];

function compaer(input1,input2){
        client.get('search/tweets', {q: input1, count: 100, lang: 'en',recent_type: 'recent'}, function(error, tweets, response) {
            var source = input1;
            for(i = 0; i < tweets.statuses.length;i++){
            var t = natural.LevenshteinDistance(source, tweets.statuses[i].text, {search: true});
                if(t.distance <2){
                    var holder = {
                        created_at: tweets.statuses[i].created_at,
                        text: tweets.statuses[i].text
                    }
                    word1.push(holder);
                }
            } 
            console.log(word1.length);
         });
         client.get('search/tweets', {q: input2, count: 100, lang: 'en',recent_type: 'recent',}, function(error, tweets, response){
            var source = input2;
            for(i = 0; i < tweets.statuses.length;i++){
            var t = natural.LevenshteinDistance(source, tweets.statuses[i].text, {search: true});
                if(t.distance <2){
                    var holder = {
                        created_at: tweets.statuses[i].created_at,
                        text: tweets.statuses[i].text
                    }
                    word2.push(holder);
                }
            }
            console.log(word2.length);
    
         });
         //console.log(date.getMinutes() + ',' + date.getSeconds())
}

client.get('search/tweets', {q: 'Lebron', count: 100, lang: 'en',recent_type: 'recent',}, function(error, tweets, response){
    console.log(tweets.statuses);
 });



app.get ('/index', (req, res) => {
    //compaer('Ronaldo',',Messi');
        res.render('test', {
            word1
        })

});

app.get ('/search/results', (req, res) => {
    res.render('searchResults', {
        
    })
});

app.listen(3000, () => {
    console.log('Server listening on port: ', 3000);
});