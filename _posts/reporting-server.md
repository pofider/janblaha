{{{
    "title"    : "Reporting Server",	
    "date"     : "11-11-2014 14:09"
}}}

It is a practice to open with a definition. Unfortunately there is no satisfying definition out there so I decided to put short one together.

> Reporting server is a system capable of rendering reports based on the client request parameters, where report is meant as a document with various possible formats visually representing a system state. 

If you are looking for one, there are few solutions out there fulfilling this simple definition. This post won't compare them but rather focus just on one of them. The goal here is to present [jsreport](http://jsreport.net) and describe how does it cover previous definition.

##jsreport basics

jsreport was developed from the start to serve the purpose of reporting server. You can [install it on your own machine](http://jsreport.net/on-prem) for free or use [online service](http://jsreport.net/online). The workflow using jsreport is similar to any other reporting server. 

1. define report data source
2. define report visual representation and output format
3. call API and get back report document

jsreport is probably the only one reporting server that is cross platform running on javascript. Not only it's running on javascript based [node.js](http://nodejs.org) server but also whole report definition is based on [javascript templating engines](http://jsreport.net/learn/templating-engines). 

##Output formats
jsreport report rendering is a base extension point where you can hook with your own rendering implementation.  The report rendering process is called [jsreport recipe](http://jsreport.net/learn/recipes). There are several recipes provided out of the box mainly supporting `html` and `pdf` output format. Probably the most popular one is [phantom-pdf recipe](http://jsreport.net/learn/phantom-pdf) which generates pdf using html conversion. You can for example define report using [jsrender templating engine](http://jsreport.net/learn/jsrender) and let it print into pdf. 

```html
<table>
	{{for people}}
		<tr>
			<td>{{#name}}</td>
			<td class="{{if age < 18}}red{{else}}blue{{/if}}">
				{{#age}}
			</td>			
		</tr>
	{{/for}}
</table>
```

##Designer
There is no need to install a report designer on every client because jsreport designer is based on html5 and running in any browser. jsreport designer is basically just an enhanced code editor providing unlimited possibilities to the output report.

![studio](http://www.janblaha.net/img/jsreport-screen.png)

##Various data sources

There are two ways how you can define data source. The simpler one is to push input data into server using api. This means when you want to render a report you first collect data from any data source and send them to the report server inside rendering request. 

The second way uses jsreport [scripts extension](http://jsreport.net/learn/scripts). Using this extension you can define a custom script that will be evaluated in reporting server before the real rendering process starts. This script can collect any data from data source or even from remote API.

##Conclusion
jsreport is fully flagged free reporting server running on every main platform.  It includes a html based report designer used to manage reports. Report definition is based just on javascript templating engines which gives unlimited possibilities to the resulting reports. It supports out of the box `html` and `pdf` output formats and yes, everything is opensourced on [github](https://github.com/jsreport).