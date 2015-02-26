{{{
    "title"    : "Export pdf from SharePoint",	
    "date"     : "01-03-2015 15:09",
    "tags"     : [ "jsreport", "sharepoint" ]
}}}

You may find yourself in a situation when you want to visualize data from SharePoint lists in form of a pdf document. It can be for example a monthly summary report with some tables and charts or it can be a simple pdf invoice. You can handle such a task using Excel pdf export but you will soon realize there are way too many limitations in this approach. Especially if you need to follow specific document layout or automate this task. Another SharePoint native approach is to use Sql Server Reporting Services (SSRS). This may give you more options to automate creating pdf document. On the other hand it is more difficult to design document structure. The first trouble is that you need to install a SSRS desginer on your desktop. The next annoyance is the designer itself. It is very limited in designing actual document. For example you have just couple of chart types or tables you can use and everything feels very unnatural for a software developer. Now we have exhausted SharePoint native options and it is time to check out the Office Store. 

Exploring Office Store you may find several list exporters. Some of them have a built in pdf designer however still very limited. If you are searching for an app able to export pdf without any limitation you should choose jsreport SharePoint application.

[jsreport](http://jsreport.net) is open source reporting server based on javascript templating engines capable of creating any pdf document you can think of.  It contains SharePoint application available in [Office Store](https://store.office.com/jsreport-WA104379180.aspx) with integrated pdf designer and API ready to be used for rendering documents. Both platforms fits nicely together and you don't need to leave SharePoint or install any additional tools. Let's look at the main principles and strong sides of using jsreport in SharePoint.

##Designer
One of the strongest sides of jsreport is SharePoint integrated document designer. It can be opened directly from SharePoint form and used to design and preview pdf documents in your browser. The designer is something like source code editor rather then a visual drag and drop component. This gives you more power and remove limitations for output pdf. Document definition you create in jsreport designer is then stored inside custom SharePoint list so there is no need to worry about data safety and you can also apply permission rules to restrict user access.

![sharepoint pdf](http://janblaha.net/img/blog/sharepoint.gif)


##Fetching data from SharePoint lists
The pdf document typically displays some dynamic information rather than static predefined text. These information are stored in lists in SharePoint word and they need to be fetched. jsreport doesn't limit you in any way which lists you want to use for pdf document or how the lists data should be filtered. It lets you to write a custom javascript which you use to request data from SharePoint OData API. This gives you full control over data being fetched and filtered as well. The next example shows how you can request data from a single list using custom javascript and OData API. It is very simple, you basically only need to create valid OData URI. You can find many examples and official documentation for further study <a href='http://msdn.microsoft.com/en-us/library/office/fp142385(v=office.15).aspx'>here</a>.

```js
require("sharepoint-request")(request, 
  "/sites/test/_api/web/lists('guid')/items?$expand=Products/Name",
  function (err, data) {
	request.data = data; 
	done();
}
```

##Designing layout
When you have defined document input data it's time to create pdf layout. You use just html, css and javascript to create pdf in jsreport. You can even use any third-party javascript library like jquery or any advanced charting library like highcharts. Every standard is supported and well converted into pdf directly in jsreport designer.

To be able to insert previously loaded SharePoint data into pdf you can use javascript templating engines. Using templating engines you can create tables, charts, conditional formatting or basically any pdf structure you want. The next example shows how you can iterate over previously loaded SharePoint data and create html table which is later automatically converted into pdf.

```html
<table>
   {{for #data.value}}
   <tr>
      <td>{{:Name}}</td>
      <td>{{:Salary}}</td>
   </tr>   
   {{/for}}
</table> 
```


##Quick start

The best start with jsreport is to install it into your SharePoint site from Office Store. It will create a sample during installation you can play with and explore features it provides.

> **[jsreport and SharePoint quick start official documentation](http://jsreport.net/learn/reports-in-sharepoint)**    

> **[jsreport in Office Store](https://store.office.com/jsreport-WA104379180.aspx)**    


