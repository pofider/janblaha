{{{
    "title"    : "Excel reports in c# and asp.net",
    "date"     : "09-12-2017 18:40",
    "tags"     : [ "jsreport" ],
    "slug"     : "excel-reports-in-csharp-and-aspnet"
}}}

Quite some time ago I blogged about rendering [pdf reports in c#](https://jsreport.net/blog/pdf-reports-in-csharp). Recently we have added excel reports into [jsreport](https://jsreport.net) and it was released with a little delay  also into .NET. This means you should be able to use both [html-to-xlsx](https://jsreport.net/learn/html-to-xlsx) and [xlsx](https://jsreport.net/learn/xlsx) recipes to create excel files from your .NET environments now.

## Quick Start

First you need to get jsreport. You can use [standalone server](https://jsreport.net/on-prem), [jsreportonline](https://jsreport.net/online) service or run jsreport instance through [.NET jsreport sdk](https://jsreport.net/learn/dotnet) which will start jsreport along with your .NET process. The easiest is to start with the last option.

So first install [jsreport.Local](https://www.nuget.org/packages/jsreport.Local/) and [jsreport.Binary](https://www.nuget.org/packages/jsreport.Binary) nugets:

`Install-Package jsreport.Local`    
`Install-Package jsreport.Binary`

Then initialize local rendering service using the following code:
```csharp
var rs = new LocalReporting().UseBinary(JsReportBinary.GetBinary()).AsUtility().Create();
```

Now you are ready for rendering excel files. The easiest is to use [html-to-xlsx](https://jsreport.net/learn/html-to-xlsx) recipe which will convert input html table into xlsx file:

```csharp
var report = await rs.RenderAsync(new RenderRequest()
{
	Template = new Template()
	{
		Content = "<table><tr><td>Hello World</td></tr></table>",
		Recipe = Recipe.HtmlToXlsx
	}
});
```

The `report.Content` now contains stream to xslx file. Pretty simple right? There are several limitations described in the [documentation](https://jsreport.net/learn/html-to-xlsx). The most important is to keep in mind that you need provide a valid table inside html. Everything outside table wont be transformed to the excel file. You can also use several css styles like width, height, borders, align or colors.

##Html rendering
You probably won't assemble html using a `StringBuilder`. Better is to use  [javascript templating engines](https://jsreport.net/learn/templating-engines) jsreport evaluates. Extending previous `RenderRequest` with some input data and dynamic html rendering using [jsrender](https://jsreport.net/learn/jsrender) looks following:

```csharp
new RenderRequest() {
	Template = new Template() {
		Content =
			"<table>" +
			"{{for people}}" +
			"<tr><td>{{:#data}}</td></tr>" +
			"{{/for}}" +
			"</table>",
		Recipe = Recipe.HtmlToXlsx,
		Engine = Engine.JsRender
	},
    Data = new  {
	    people = new [] { "Jan Blaha", "John Lennon"}
    }
}
```

##ASP.NET MVC
This may sound crazy but you can also render excel report directly from your ASP.NET MVC views. This can be done using [jsreport.MVC](https://jsreport.net/learn/asp-net-mvc) nuget package. It will let you to assemble html using for example Razor engine inside your views and convert to pdf or excel afterwards before sending out from the server.

First install [jsreport.MVC](https://www.nuget.org/packages/jsreport.MVC) nuget package:

`Install-Package jsreport.MVC`

Then register `JsReportFilterAttribute` asp.net mvc filter
```csharp
filters.Add(new JsReportFilterAttribute(new LocalReporting()
        .UseBinary(JsReportBinary.GetBinary())
        .AsUtility()
        .Create()));
```

Now you can tag any controller action with `EnableJsReport` and specify how shall be the output transformed. For example to transform html into excel you can use:

```csharp
[EnableJsReport()]
public ActionResult Xlsx()
{
  HttpContext.JsReportFeature().Recipe(Recipe.HtmlToXlsx);
  return View();
}
```

##Conclusion
Excel reports is just a small part of jsreport platform. You can render also pdf, xml or csv reports in the same unified way. You can also let your
customers to customize reports and jsreport will safely render desired outputs or completely separate your reporting out from your application
into a loosely coupled reporting server.

I encourage you to check out [jsreport.net](https://jsreport.net) and in particular [.NET jsreport sdk](https://jsreport.net) for more .NET demos, videos and tutorials.