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

//bucketName
const bucketName = 'compareme-wikipedia-store';

//Create a promise 
const bucketPromise = new AWS.S3({ apiVersion: '2006-03-01' }).createBucket({ Bucket: bucketName }).promise();
bucketPromise.then(function (data) {
    console.log("Using S3 bucket: " + bucketName);
})
.catch(function (err) {
    console.error(err, err.stack);
});

//redis client
const redisClient = redis.createClient();
redisClient.on('error', (err) => {
    console.log("Error " + err);
});

//Variables to hold data
var word1 =[];
var word2= [];

var classified = [
    actor = {
        keywords: ["comedy","barrymore","mime","actress","drama","thespian","doer","fairbanks","performer","radio","dustin hoffman","theatre","film","character","movie","comedian","pantomime","player","screenplay","television","tragedy","act","tragedian","barnstormer","thespis","greece","star","acting","moore","fonda","hanks","gibson","allen","keaton","worker","histrion","portrayal","role player","spear carrier","role","performance","prepubescent","filmmaker","screenwriter","robin williams","entertainer","sir anthony hopkins","sir alec guinness","robert redford","anthony hopkins","edmund kean","robert de niro","woody allen","playwright","musician","singer","academy award for best actress","silent film","actresses","scriptwriter","screen test","jack lemmon","william shakespeare","europe","ancient rome","opera","laurence olivier","academy award for best supporting actress","early middle ages","peter pan","mezzo-soprano","puritan","late middle ages","commedia dell'arte","theatrical","cooper","lunt","harrison","guinness","grant","poitier","gielgud","garrick","lorre","gable","drew","lee","booth","laughton","depardieu","dean","crosby","coward","lugosi","chevalier","cagney","burton","burbage","kelly","bogart","astaire"]
    },
    athelete = {
        keywords:["athletics","spectator sport","competition","game","racing","gymnastics","sportsman","soccer","rugby union","association football","downfield","offside","cycling","tennis","polo","team","hockey","football","skating","professional sport","athletic","run","call","referee","kill","spar","judo","ineligible","wipeout","schuss","luge","athletic game","team sport","archery","upfield","contact sport","professional football","funambulism","toboggan","professional baseball","professional basketball","personal foul","bobsled","outdoor sport","skiing","riding","skateboard","speed skate","jackknife","ski","sportswoman","rollerblade","figure skate","rowing","ice skate","roller skate","fun","regulation time","play","physical activity","disport","lark","blood sport","baseball","daisy cutter"]
    },
    musician = {
        keywords: ["music","composer","pianist","bassist","singer","percussionist","violinist","flutist","instrumentalist","accompanist","clarinetist","vocalist","guitarist","artist","saxophonist","keyboardist","virtuoso","trumpeter","cellist","trombonist","flautist","organist","jazz","songwriter","classical music","player","piano","band","renaissance","musical instrument","arranger","performer","singing","musical","soloist","conductor","harpsichordist","orchestration","guitar","choirmaster","polyphonic","baritone","melody","fiddler","rocker","accordionist","harpist","lutenist","song","jazzman","clarinettist","saxist","counterpoint","lyricist","bandleader","drummer","jazz musician","actor","dancer","entertainer","folk","comedian","filmmaker","musicologist","poet","church","crooner","folk music","popular music","performing","conducting","philharmonic","violist","orff","ono","herbert","harper","oboist","adapter","transcriber","vibraphonist","piper","director","cantor","precentor","arranging","haydn","wagner","clarion","pizzicato","cantabile","musically","beethoven","largo","qawwali","classical","chopin","riddim","musicology","orchestrate","musicality","recapitulation","tune","loudness","tweedle","hornist","vocalizer","violoncellist","vocaliser","accompanyist","concertinist","cornetist","lutanist","harmoniser","vibist","gambist","carillonneur","bandsman"]
    },
    influencer = {
        keywords: ["celebrity","social media","influencer marketing","blogging","marketing","youtuber","notability","celeb","internet","facebook","twitter","sixdegrees.com","youtube","instagram","tiktok","blogs","wechat","whatsapp","snapchat","vsco","lifestyle guru","momus","personal branding","influence","determinant","stakeholder","factor","communicator","social","marketer","facilitator","advertiser","shaper","segmentation","contributor","podcasting","encourager","analytics","savvy","brands","adopter","gatekeeper","panelist","attendee","salesperson","innovator","sustainer","predictor","endorser","aggregator","trends","verticals","ideation","metrics","kingmaker","tool","maven","inviter","component","demographics","preferences","affluents","follower","philanthropy","panellist","confidante","evangelizing","multichannel","behaviors","evangelists","boomer","variety","hollywood","personality type","vlogging","viral phenomenon","viral video","pewdiepie","internet meme","psychographics","enabler","trendsetters","motivators","differentiator","trendsetter","intrapreneur","implementer","isobar","networker","determiner","twitterer","prescriber","marketeer","definer","aruspex","inceptor","couponing","recommenders","nurturer","creatives","reputability","recommender","swayful","flexitarian","babytalk","jobholder","mktg","schmoozer","discriminator","prsa","embracer"]
    }
]

function compaer(input1,output,redisKey,s3Key){
        client.get('search/tweets', {q: input1, count: 100, lang: 'en',recent_type: 'popular'}, function(error, tweets, response) {
            var source = input1;
            var type; 
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
            
            for(i = 0; i < classified.length;i++){
                for(j = 0; j < classified[i].keywords.length;j++){
                    var source = classified[i].keywords[j];
                    var t =  natural.LevenshteinDistance(source, output[i].text, {search: true});
                    if(t.distance < 1){
                        type = source; 
                    }
                }
            }

            console.log(output[1].category);
            console.log(output.length);

                //Store total in s3 
                const body = JSON.stringify({
                    total: type
                });
                const objectParams = {
                    Bucket: bucketName,
                    Key: s3Key,
                    Body: body
                };
                const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' }).putObject(objectParams).promise();
                uploadPromise.then(function (data) {
                    console.log("Data uploaded to " + bucketName + "/" + s3Key + " and Redis Cache.");
                });

            //Store in cache
            redisClient.set(redisKey, JSON.stringify(output),'EX',30);
         });
}

app.get ('/index', (req, res) => {
    var searchItem1 = req.query.search1;
    var searchItem2 = req.query.search2;
    const redisKey1 = `compareme:${searchItem1}`;
    const s3Key1 = `compareme-${searchItem1}`;
    const redisKey2 = `compareme:${searchItem2}`;
    const s3Key2 = `compareme-${searchItem2}`;

    //initialise arrays to keep it empty
    word1= [];
    word2 = [];
    //
    const params1 = { Bucket: bucketName, Key: s3Key1 };
    const params2 = { Bucket: bucketName, Key: s3Key2 };
    
    if(searchItem1 && searchItem2){

        redisClient.get(redisKey1, (err,result) =>{
            //Checks if it is in the cache
            if(result){
                word1 = JSON.parse(result); 
                console.log("Real");
            } else {
                return new AWS.S3({ apiVersion: '2006-03-01' }).getObject(params1, (err, result) =>{
                    if(result){
                        console.log(JSON.parse(result.Body));
                        ifIns3 = true; 
//                       compaer(searchItem2,word2,redisKey2,s3Key2);
//                       cached2 = false; 
//                       console.log("Cached");
                    }else{
    
                    }
                    compaer(searchItem1,word1,redisKey1,s3Key1);
                    cached2 = false; 
                    console.log("Cached");
                });
            }
        });

        redisClient.get(redisKey2, (err,result) =>{
            //Checks if it is in the cache
            if(result){
                word2 = JSON.parse(result); 
                cached2 = true; 
                console.log("Real");
            } else {
                //Checks if not in cache checks in the s3 Storage, if it is 
                return new AWS.S3({ apiVersion: '2006-03-01' }).getObject(params2, (err, result) =>{
                    if(result){
                        console.log("result");
                    }else{
    
                    }
                    compaer(searchItem2,word2,redisKey2,s3Key2);
                    cached2 = false; 
                    console.log("Cached");
                });
            }
        });
        var t = [];
        
        setTimeout(function(){
                console.log('slow');
                var dataInput1 = parseInt(word1.length);
                var dataInput2 = parseInt(word2.length);
                var dataSet = [dataInput1, dataInput2, 0];
                var dataSet2 = [searchItem1,searchItem2, ""]


                t = 
                '<script>' +
                    'var ctx = document.getElementById("myChart").getContext("2d");'+
                    'var myChart = new Chart(ctx, {'+
                        'type: "bar",'+
                        'data: {'+
                            'labels: ["'+searchItem1+'","'+searchItem2+'"],'+
                            'datasets: [{'+
                                'label: "# of Votes",'+
                                'data: ['+dataInput1+','+dataInput2+'],'+
                                'backgroundColor: ['+
                                    '"rgba(255, 99, 132, 0.2)",'+
                                    '"rgba(54, 162, 235, 0.2)"'+
                                '],'+
                                'borderColor: ['+
                                    '"rgba(255, 99, 132, 1)",' +
                                    '"rgba(54, 162, 235, 1)"'+
                                '],'+
                                'borderWidth: 1'+
                            '}]'+
                       '},'+
                        'options: {'+
                            'scales: {'+
                                'yAxes: [{'+
                                    'ticks: {'+
                                       'beginAtZero: true'+
                                    '}'+
                                '}]'+
                            '}'+
                        '}'+
                    '});'+
                '</script>'

                /*
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
                    */
        },5000);
    }
    setTimeout(function(){
        res.render('index', {
            t,
            word1,
            word2
        })
    },5000);

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