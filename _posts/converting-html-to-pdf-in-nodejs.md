{{{
    "title"  : "Converting html to pdf in node.js",  
    "date" :  "09-02-2014 21:49",
    "tags" : [ "jsreport" ],
    "slug" : "converting-html-to-pdf-in-nodejs"
}}}

jsreport is a quite complex platform for doing pdf reports but it can be easily used also in very simple use cases like html to pdf conversion. You just need to do one function call and it will spin for you a [phantomjs webkit](http://phantomjs.org/) worker and print html into pdf.

> npm install jsreport

```js
require("jsreport").render("<h1>Hi there!</h1>").then(function(out) {
    //pipe pdf with "Hi there!"
    out.result.pipe(resp);
});
```

As a bonus you get all other jsreport features:

1. great performance when doing many conversions because it will keep couple of phantom.js instances hot and running for the whole time 
2. time out handling - it will recycle phantom.js instance when rendering takes long time
3. javascript templating engines rendering - you can just send template and it will render html dynamically using specified javascript templating engine, input data and helper functions

Check out [jsreport node.js documentation](http://jsreport.net/learn/nodejs) for other benefits.
