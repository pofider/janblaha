﻿var fs = require("fs"),
    path = require("path"),
    Poet = require('poet')
    marked = require("marked"),
    Prism = require('prismjs'),
    languages = require('prism-languages'),
    cache = {};

function highlight(code, lang, callback) {    
    try {
        return callback(null, Prism.highlight(code, languages[lang]));
    } catch (err) {
        callback(err)    
    }
}

module.exports = function(app) {
    var poet = Poet(app, {
        postsPerPage: 300,
    });

    marked.setOptions({
        highlight: highlight
    });

    app.get("/blog", function(req, res) {
        res.render('posts-list', {
            posts: poet.helpers.getPosts(0, 99999),
            blog: true
        });
    });

    app.get('/sitemap*', function(req, res) {
        var postCount = poet.helpers.getPostCount();
        var posts = poet.helpers.getPosts(0, postCount);
        res.setHeader('Content-Type', 'application/xml');
        res.render('sitemap', { posts: posts, layout: false });
    });

    poet.addTemplate({
        ext: 'md',
        fn: function(s, cb) {
            marked(s, function(err, content) {
                if (err) return cb(err);
                cb(null, content);
            });
        }
    });

    poet.addRoute('/blog/:post', function(req, res, next) {
        var post = poet.helpers.getPost(req.params.post);
        if (post) {
            
            if (cache[req.params.post]) {
                return res.render('post', cache[req.params.post]);
            }

	    cache[req.params.post] = {
                post: post,
                linkDocCss: true,
                url: "/blog/" + post.url,
                fullUrl: "http://jsreport.net/blog/" + post.url,
                id: req.params.slug,
                blog: true,
                title: post.title
            };

            res.render('post', cache[req.params.post]);
        } else {
            res.send(404);
        }
    });

    poet.addRoute('/tag/:tag', function(req, res, next) {
        var tag = req.params.tag,
            posts = poet.helpers.postsWithTag(tag);
      
        res.render('tag', {
            posts: posts,
            tag: tag
        });
    });

    return poet;
}
    
   