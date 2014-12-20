m{{{
    "title"    : "Excel reports in c# and asp.net",
    "date"     : "12-20-2014 19:09",
    "tags"	   : [ "jsreport" ]
}}}

Quite some time ago I blogged about rendering [pdf reports in c#](http://jsreport.net/blog/pdf-reports-in-csharp). Recently we have added excel reports into [jsreport](http://jsreport.net) and it was released with a little delay  also into .NET. This means you should be able to use both [html-to-xlsx](http://jsreport.net/learn/html-to-xlsx) and [xlsx](http://jsreport.net/learn/xlsx) recipes to create excel files from your .NET environments now.

## Quick Start

First you need to get jsreport. You can use [standalone server](http://jsreport.net/on-prem), [jsreportonline](http://jsreport.net/online) service or [nugget package](http://jsreport.net/learn/net-embedded) which will start jsreport along with your .NETprocess. The easiest is to start with the last option.

So first install jsreport.Embedded nuget

`Install-Package jsreport.Embedded`

Then start embedded reporting server. This will start node process running jsreport and bind it's life cycle with your application.
```c#
var server = new EmbeddedReportingServer();
await server.StartAsync();
```

Now you are ready for rendering excel files. The easiest is to use [html-to-xlsx](http://jsreport.net/learn/html-to-xlsx) recipe which will convert input html table into xlsx file. Rendering is invoked using [jsreport c# client](http://jsreport.net/learn/net-client) as follows:

```c#
var report = await server.ReportingService.RenderAsync(new RenderRequest()
                {
                    template = new Template()
                        {
                            content = "<table><tr><td>Hello World</td></tr></table>",
                            recipe = "html-to-xlsx"
                        }
                });
```

The `report.Content` now contains stream to xslx file. Pretty simple right? There are several limitations described in the [documentation](http://jsreport.net/learn/html-to-xlsx). The most important is to keep in mind that you need provide a valid table inside html. Everything outside table wont be transformed to the excel file. You can also use several css styles like width, height, borders, align or colors.

##Html rendering
You probably won't assemble html using a StringBuilder. Better is to use  [javascript templating engines](http://jsreport.net/learn/templating-engines) jsreport evaluates. Extending previous `RenderRequest` with some input data and dynamic html rendering using [jsrender](http://jsreport.net/learn/jsrender) looks following:

```c#
new RenderRequest() {
	template = new Template() {
		content =
			"<table>" +
			"{{for people}}" +
			"<tr><td>{{:#data}}</td></tr>" +
			"{{/for}}" +
			"</table>",
		recipe = "html-to-xlsx",
		engine = "jsrender"
	},
        data = new  {
	        people = new [] { "Jan Blaha", "John Lennon"}
        }
}
```

##Using visual studio extension
You can also benefit from [jsreport visual studio extension](http://jsreport.net/learn/visual-studio-extension) if you want. This extension allows you to create excel and pdf reports directly inside your visual studio solution. This can very handy during design time especially for pdf reports. However it can be used to speed up the development also for excel reports.

![visual studio excel recipe](http://janblaha.net/img/blog/vs-excel-recipe.png)

![visual studio excel](http://janblaha.net/img/blog/vs-excel.png)

You just need to pick up the right recipe in the jsreport visual studio designer and then you should be able to preview excel.  Describing how this extension works is out of the scope, please follow the documentation [here](http://jsreport.net/learn/visual-studio-extension).

##ASP.NET MVC
This may sound crazy but you can also render excel report directly from your ASP.NET MVC views. This can be done using [jsreport.MVC](http://jsreport.net/learn/asp-net-mvc) nuget package. It will let you to assemble html using for example Razor engine inside your views and convert to pdf or excel afterwards before sending out from the server.

First install `jsreport.MVC` package:

`Install-Package jsreport.MVC`

Then register `JsReportFilterAttribute` asp.net mvc filter
```c#
//using embedded server created previously
filters.Add(new JsReportFilterAttribute(server.ReportingService));
```

Now you can tag any controller action with `EnableJsReport` and specify how shall be the output transformed. For example to transform html into excel you can use:

```c#
[EnableJsReport(Recipe = "html-to-xlsx")]
public ActionResult Xlsx()
{
  return View();
}
```

##Conclusion
Excel reports is just a small part of jsreport platform. You can render also pdf, xml or csv reports in the same unified way. You can also let your
customers to customize reports and jsreport will safely render desired outputs or completely separate your reporting out from your application
into a loosely coupled reporting server.

I encourage you to check out [jsreport.net](http://jsreport.net) and also online demo for end user customizations [here](http://net-embedding.jsreport.net).