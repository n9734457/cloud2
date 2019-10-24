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
    for(j = 0; j < 3;j++){
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
    }
}


app.get ('/index', (req, res) => {
    var searchItem1 = req.query.search1;
    var searchItem2 = req.query.search2;
    
    if(searchItem1 && searchItem2){
        compaer(searchItem1,searchItem2);
    }


    var dataSet = [word1.length, word2.length]
     var dataSet2 = [searchItem1,searchItem2]
        var t = '<script>' + 
        'function renderChart(data, labels) {' +
            'var ctx = document.getElementById("myChart").getContext("2d");' +
            'var myChart = new Chart(ctx, {' +
                'type: "bar",' +
                'data: {' +
                    'labels: labels,' +
                    'datasets: [{' +
                        'label: "This week",' +
                        'data: data,' +
                    '}]' +
                '},' +
            '});' +
        '}' +
        
        '$("#renderBtn").click(' +
            'function () {' +
                'data = [' + OutputData(dataSet) + '];' +
                'labels =  [' + OutputLabels(dataSet2) + '];' +
                'renderChart(data, labels);' +
            '}' +
        ');' +
        '</script>';

    setTimeout(function(){
        res.render('index', {
            t
        })
    },2000);
});

app.get ('/search/results', (req, res) => {
    res.render('searchResults', {
        
    })
});


function OutputData(dataValues)
{
   var valueString = ''; 
   dataValues.forEach(value => {
   valueString += value + ',';
   });

   return valueString.substring(0, valueString.length - 1);
}

function OutputLabels(dataValues)
{
   var valueString = ''; 
   dataValues.forEach(value => {
   valueString += '"' + value + '",';
   });

   return valueString.substring(0, valueString.length - 1);
}

app.listen(3000, () => {
    console.log('Server listening on port: ', 3000);
});