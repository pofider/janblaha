var express = require('express'),
    exphbs = require('express3-handlebars'),
    app = express(),
    posts = require("./posts.js"),
    fs = require('fs');

var twitterKeys
try {
    twitterKeys = JSON.parse(fs.readFileSync('./twitter.keys.json', 'utf8'))    
} catch (e) {
    console.error(e)
}

var hbs = exphbs.create({
    defaultLayout: 'main',
    extname: ".html",
    helpers: {
        fixCoding: function(content) {
            if (content.charAt(0) === '\uFEFF')
                content = content.substr(1);
            return content;
        },
        toShortDate: function(date) {
            return require("moment")(date).format("MM-DD-YYYY");
        },
        toLongDate: function(date) {
            return require("moment")(date).format("MM-DD-YYYY HH:mm");
        },
    }
});

app.engine('.html', hbs.engine);
app.set('view engine', '.html');
app.use(express.static('public/'));

app.get('/current-projects', function(req, res) {
    res.render('current-projects', {
        currentProjects: true
    });
});

app.get('/about-me', function(req, res) {
    res.render('about-me', {
        aboutMe: true
    });
});

app.get('/', function(req, res) {    
    res.render('home', {
        showTweets: true
    });
});


var lastTweets;
var lastPosts;
var poet;


function loadTweets(cb) {
    if (!twitterKeys) {
        return cb()
    }

    function parseTwitterDate(text) {
        return new Date(Date.parse(text.replace(/( +)/, ' UTC$1')));
    }

    var twitter = require('twitter');    
    var twit = new twitter({
        consumer_key: twitterKeys['consumer_key'],
        consumer_secret: twitterKeys['consumer_secret'],
        access_token_key: twitterKeys['access_token_key'],
        access_token_secret: twitterKeys['access_token_secret']
    });

    var twitterHelper = require('twitter-text');

    twit.getUserTimeline({ exclude_replies: true }, function(tweets) {
        lastTweets = tweets.filter(function(t) { return !t.retweeted; }).map(function(t) {
            t.text = twitterHelper.autoLink(t.text);
            t.created_at = parseTwitterDate(t.created_at);
            return t;
        }).slice(0, 3);
        cb();
    });
}

function refresh(cb) {
    loadTweets(function() {        
        poet.init().then(function(poet) {            
            lastPosts = poet.helpers.getPosts(0, 3);
            app.locals({
                lastPosts: lastPosts,
                lastTweets: lastTweets
            });

            cb();
        });
    });
}

poet = posts(app);

refresh(function() {
    app.get('*', function(req, res) {
                res.status(404).render("404");
    });
    app.listen(process.env.PORT || 1000);    
});

setTimeout(function() { setInterval(refresh, 1800000); }, 1800000);