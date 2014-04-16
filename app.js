var express = require('express'),
    exphbs = require('express3-handlebars'),
    app = express();

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
    console.log(JSON.stringify(req.headers));
    res.render('home', {
	showTweets: true       
    });
});


var lastTweets;
var lastPosts;


function loadTweets(cb) {

    function parseTwitterDate(text) {
        return new Date(Date.parse(text.replace(/( +)/, ' UTC$1')));
    }

    var twitter = require('twitter');
    var twit = new twitter({
        consumer_key: 'CkZxWsyDCWM86o8BdChKNX3tX',
        consumer_secret: 'wELjC4tvLOvB4eFJL88v7ElN0TWZn7VbYghIXFDdHBpFccHbpg',
        access_token_key: '163233584-OWn9WRmuuryC9SBfE3kfpSUEazATd7Di69pyxOGC',
        access_token_secret: 'IjxS8KeWufGm4G4QSFHnNXkU18LmBaXRCf4IwjGsag1SR'
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


loadTweets(function() {
    require("./posts.js")(app).then(function(poet) {
        app.get('*', function(req, res) {
            res.status(404).render("404");
        });

        lastPosts = poet.helpers.getPosts(0, 3);
        app.locals({
            lastPosts: lastPosts,
	        lastTweets: lastTweets
        });

        app.listen(process.env.PORT);
    });
});