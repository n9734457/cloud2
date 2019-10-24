const express = require('express');
const responseTime = require('response-time')
const axios = require('axios');
const redis = require('redis');
const Twitter = require('twitter');
const http = require('http')
const path = require("path");
const exphbs = require('express-handlebars');
var natural = require('natural');

const AWS = require('aws-sdk');

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

//
const bucketName = 'compareme-twitter-store';

//S3 Promise 
const bucketPromise = new AWS.S3({ apiVersion: '2006-03-01' }).createBucket({ Bucket: bucketName }).promise();
bucketPromise.then(function (data) {
    console.log("Using S3 bucket: " + bucketName);
})
.catch(function (err) {
    console.error(err, err.stack);
});

// This section will change for Cloud Services
const redisClient = redis.createClient();
redisClient.on('error', (err) => {
    console.log("Error " + err);
});

var word1 =[];
var word2= [];
function compaer(input1,output){
        client.get('search/tweets', {q: input1, count: 100, lang: 'en',recent_type: 'popular'}, function(error, tweets, response) {
            var source = input1;
            for(i = 0; i < tweets.statuses.length;i++){
            var t = natural.LevenshteinDistance(source, tweets.statuses[i].text, {search: true});
                if(t.distance <2){
                    var holder = {
                        created_at: tweets.statuses[i].created_at,
                        name: tweets.statuses[i].user.name,
                        profile_img: tweets.statuses[i].user.profile_image_url_https,
                        text: tweets.statuses[i].text
                    }
                    output.push(holder);
                }
            } 
         });
}

client.get('search/tweets', {q: 'messi', count: 100, lang: 'en',recent_type: 'popular',}, function(error, tweets, response){
    console.log(tweets.statuses[0].user.profile_image_url_https);
});

app.get ('/index', (req, res) => {
    var searchItem1 = req.query.search1;
    var searchItem2 = req.query.search2; 
    const redisKey1 = `compare:`+ searchItem1;
    const redisKey2 = `compare:`+ searchItem2;
    const s3Key1 = `compare-`+ searchItem1;
    const s3Key2 = `compare-`+ searchItem2;

    //
    const params1 = { Bucket: bucketName, Key: s3Key1 };

    const params2 = { Bucket: bucketName, Key: s3Key2 };

   /* return redisClient.get(redisKey1, (err,result) => {
        if (result){
            console.log("Data for '" + searchItem1 + "' already exists in Redis Cache. Serving in Cache.");
            const resultJSON = JSON.parse(result);
            return res.status(200).json(resultJSON);
        }
    });*/

    word1= [];
    word2 = [];

    if(searchItem1 && searchItem2){
    compaer(searchItem1,word1);
    compaer(searchItem2,word2);
    var t = [];
    setTimeout(function(){
            var dataInput1 = parseInt(word1.length);
            var dataInput2 = parseInt(word2.length);
            var dataSet = [dataInput1, dataInput2, 0];
             var dataSet2 = [searchItem1,searchItem2, ""]
                t = '<script>' + 
                'function renderChart(data, labels) {' +
                    'var ctx = document.getElementById("myChart").getContext("2d");' +
                    'var myChart = new Chart(ctx, {' +
                        'type: "bar",' +
                        'data: {' +
                            'labels: labels,' +
                            'datasets: [{' +
                                'label: "Comparison",' +
                                'BackgroundColor: "rbg(225,99,132)",'+
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
    },2000);
}
    setTimeout(function(){
        res.render('index', {
            t,
            word1,
            word2
        })
    },2000);
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