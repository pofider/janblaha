{{{
    "title"    : "Pdf reports as a service",  
    "date"     : "09-28-2014 19:56",
    "tags"	   :[ "jsreport" ],
    "preview"  : "Software as a service is a great deal. It's saving work to the developers and decreasing costs as well. There are plenty of services making a developer life easier and their number is recently rapidly increasing with expansion of the cloud computing."
}}}

## Reports as a service
Software as a service is a great deal. It's saving work to the developers and decreasing costs as well. There are plenty of services making a developer life easier and their number is recently rapidly increasing with expansion of the cloud computing. Personally I like it very much especially when the service has reasonable pricing. I wouldn't even think about deploying a mail or continuous integration server when there are such great cheap services already for this. Although there are services for almost everything I didn't found a service capable of rendering pdf reports. The problem of current reporting software is that it's running on the top of the database or it's a library you pack as a part of the application. There are technical and security limitations preventing this software from running as a service.  You cannot just take a random software and provide it as a service. You must think about it from the start of the software development. With this in mind I started more then a year ago designing a new reporting software...

[jsreport](http://jsreport.net) was open sourced and released couple of months ago and works pretty well based on [number of downloads](https://www.npmjs.org/package/jsreport). It is [downloadable](http://jsreport.net/downloads) to an on premise server  or can be used as [reports as a service](http://jsreport.net/online).  I will quickly describe main idea of jsreport and then I will highlight the biggest benefits using [jsreport as a service](http://jsreport.net/online).

##jsreport
jsreport main idea is to throw away silly report designers and unbound report developers. Let them design reports using code and languages they know like javascript or html. Developers then design reports in jsreport mostly using well known [javascript templating engines](http://jsreport.net/learn/templating-engines) and let jsreport to evaluate them and convert result into pdf using [phantomjs](http://jsreport.net/learn/phantom-pdf) for example. jsreport is not an integrated part of the application but it's a reporting server with external API used by other applications. This allows to decouple all the reporting concerts out from the application core as well as to scale reporting separately from your application.

###Secure by design
It is crucial for a reporting service evaluating external source code to run securely. This means no one can touch service hard drive or shut down the service. This is quite difficult topic when you want to evaluate external java or c# code but fortunately quite easy when evaluating javascript. jsreport takes advantage from this and sandbox javascript code building a report inside [node.js](http://nodejs.org/) sandbox. 

###High performance pdf rendering
jsreport service needs to render millions of reports with high throughput  and keep the low price. This is achieved by superbly implemented jsreport core and optimizations in communication with phantomjs. High throughput  is then satisfied using node.js event based web server. All of this results in capability of rendering 600 pdf pages per second on just one server. Some details about jsreport performance can be found on this [blog post](http://jsreport.net/blog/pdf-reporting-performance).

###Easily extendable during peaks
Typical aspect of the application reporting is the traffic dependency on the weekday or day time. It is quite common people want to generate reports mostly on Monday evening or at the end of the month.  The reporting then can get slower during peeks and block users from the work. Solving this can be a challenge for enterprise installation but common situation for jsreport online service. The service infrastructure is based on auto scalable cloud services which can easily allocate more servers when needed. More about service infrastracture can be found on this [blog post](http://jsreport.net/blog/reporting-service-infrastructure-and-performance).

###Cheap as sending email
jsreport service [pricing](http://jsreport.net/online/pricing) was built based on high traffic and a very optimized hardware costs. The monthly price 99 dollars for 100 000 reports is very similar to the services sending emails and you will see jsreport will give you much more. We also motivate open source developers to join the jsreport team and we give all contributors a [discount](http://jsreport.net/blog/online-service-pricing).

##Conclusion
jsreport finally brings pdf reports rendering as a service for reasonable price. Get rid of your old reporting software and use innovative and  modern reporting solution. 

Register, start for free and use [pdf reports as a service](http://jsreport.net/online).




