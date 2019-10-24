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
        
        tweetData.push(data);
    }

 });

 app.get ('/index', (req, res) => {
     res.render('index', {
         
     })
 });

 function createChart(dataValues) {
    const head = '<canvas id="myChart" width="400" height="400"></canvas>' +
    "<script>" +
    "var ctx = document.getElementById('myChart');" +
    "var myChart = new Chart(ctx, {" +
        "type: 'bar'," +
        "data: {" +
            "labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange']," +
            "datasets: [{" +
                "label: '# of Votes', " +
                "data: [";

    const tail = "]," + 
            "backgroundColor: [" +
              "'rgba(255, 99, 132, 0.2)'," +
                "'rgba(54, 162, 235, 0.2)'," +
                "'rgba(255, 206, 86, 0.2)'," +
                "'rgba(75, 192, 192, 0.2)'," +
                "'rgba(153, 102, 255, 0.2)'," +
                "'rgba(255, 159, 64, 0.2)'" +
            "]," +
            "borderColor: [" +
                "'rgba(255, 99, 132, 1)'," +
                "'rgba(54, 162, 235, 1)'," +
                "'rgba(255, 206, 86, 1)'," +
                "'rgba(75, 192, 192, 1)'," +
                "'rgba(153, 102, 255, 1)'," +
                "'rgba(255, 159, 64, 1)'" +
            "]," +
            "borderWidth: 1" +
        "}]" +
    "},"
    "options: {" +
        "scales: {" +
            "yAxes: [{" +
                "ticks: {" +
                    "beginAtZero: true" +
                "}" +
            "}]" +
        "}" +
    "}" +
"});" +
"</script>";

const valueString; 

dataValues.forEach(value => {
    valueString += value + ',';
});

    return head + valueString + tail;
}

app.listen(3000, () => {
    console.log('Server listening on port: ', 3000);
});