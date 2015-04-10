{{{
    "title"    : "OData server on node.js",	
    "date"     : "02-26-2015 14:09",
    "tags"	   : [ "node.js" ]
}}}


At the very beginning when I started to work on [jsreport](http://jsreport.net) I decided to give it a standard based API. The decision was based on the fact I didn't want to design my own API syntax for doing queries like *give me an entity by name*, *give my the top five last modified entities* or *give me just entity ids*. For this kind of requests [OData](http://www.odata.org/) has already very nice syntax with bunch of clients in bunch of languages so the work for the consumers is very simple. The other stuff what OData provides like batching requests or entity relationships is rather too much for me but the plain queries are very nice so why not use it.

I quickly found [jaydata](http://jaydata.org/) library which provides JavaScript OData client as well as server libraries. It was looking great at the first glance, but unfortunately it was a huge pain for me to use it over a year. The [mongodb](https://www.mongodb.org/) based odata server it provides is super slow. It for example creates a complete new mongo client with new connection pool for every request. The client provides a nice unit of work pattern but it is something what I don't need in the browser and it just makes troubles. The jaydata team didn't answer any of my questions about the mongo server so I was forced to fork jaydata and fix or workaround very often. Finally I decided to abandon jaydata and write my own OData server. I took me couple of weeks but now it's here, with free MIT license, ready for you.

**The project is stored in github repository [node-simple-odata-server](https://github.com/pofider/node-simple-odata-server)**

> npm install simple-odata-server

```js
var express = require('express');
var app = express();
var ODataServer = require("odata-simple-server");
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(url, function(err, db) {
	odataServer = new ODataServer()
					.model(/** odata model **/)
				    .onMongo(function(cb) { cb(err, db); }); 
});

app.use('/odata', odataServer.handle.bind(odataServer);
app.listen(3000);
```

Now you are ready to serve OData requests you like. It supports mongodb, nedb or even your custom datasource. Check it out on [github](https://github.com/pofider/node-simple-odata-server) for details.




 

