const express = require('express');
const responseTime = require('response-time')
const axios = require('axios');
//const redis = require('redis');
const Twitter = require('twitter');
const http = require('http')
const exphbs = require('express-handlebars');
const app = express();
const tweetData = require('./tweetData');
const chart = require('chart.js');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');


//Twitter api connection Token 
var client = new Twitter({
    consumer_key: 'sxEwVBfoOYP0OT3WzUncMaVbf',
    consumer_secret: 'QRuxi60ycnYIdn8thFOiSGSzKivAtfQb0LU4q3XoPrVSs1FQLC',
    access_token_key: '1166624996682280963-pDGUHNoxasnGKnISsuOr2QXFVRoSDx',
    access_token_secret: 'P7jLDl5FnctOPsKdRz5j1wQRwx4bws7trMA2XrKPoieRK'
});

client.get('search/tweets', {q: '#incident', lang: 'en', count: 100}, function(error, tweets, response) {
    console.log(tweets.statuses[0].text);
    //Get each tweet status, append the text and creation date to tweetData array in separate file
    for (let index = 0; index < tweets.statuses.length; index++) {
        const data = {
        text: tweets.statuses[index].text,
        created_at:tweets.statuses[index].created_at
        }
        var d = [1, 2, 3];
        //console.log(createChart(d));
        tweetData.push(data);
    }

 });

 app.get ('/index', (req, res) => {
     var dataSet = [1000, 2000, 3000, 40000, 5000, 6500, 7777]
     var dataSet2 = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
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
     res.render('index', {
        t   
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