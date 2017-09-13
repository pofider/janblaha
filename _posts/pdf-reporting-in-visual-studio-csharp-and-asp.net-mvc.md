{{{
    "title"    : "Pdf reporting in visual studio, c# and asp.net mvc",  
    "date"     : "08-21-2014 15:19",
	"slug"     : "pdf-reporting-in-visual-studio-csharp-and-asp-net-mvc",  
	"tags"	   :[ ".NET", "jsreport" ],
	"preview"  : "With recent jsreport announcements of visual studio reporting extension and .net embedded reporting it should be pretty easy to generate pdf reports from any c# application. I decided to take a shot and extend official asp.net MVC 5 Contoso University example with reporting capabilities using jsreport."
}}}

> **UPDATE:** There is new [.NET jsreport sdk](https://jsreport.net/learn/dotnet)  available with breaking changes which makes this tutorial outdated. Please follow the videos and example in the [sdk documentation](https://jsreport.net/learn/dotnet) to get the up to date information.

<br/>    


With recent jsreport announcements of [visual studio reporting extension](http://jsreport.net/learn/visual-studio-extension) and [.net embedded reporting](http://jsreport.net/learn/net-embedded) it should be pretty easy to generate pdf reports from any c# application. I decided to take a shot and extend [official asp.net MVC 5 Contoso University](http://code.msdn.microsoft.com/ASPNET-MVC-Application-b01a9fe8) example with reporting capabilities using jsreport. It turned out it's really super simple and it took me only an hour. I will describe some steps you need to do in order to get reporting working and give you a [link to github](https://github.com/jsreport/net/tree/master/examples/ContosoUniversity) where you can download final c# source.

First install [jsreport visual studio tools extension](http://visualstudiogallery.msdn.microsoft.com/b684060e-5785-461f-832a-ffb0243a3874) into your visual studio.

Then download and open Contoso University example from [asp.net website](http://code.msdn.microsoft.com/ASPNET-MVC-Application-b01a9fe8) and make it working. You will probably need to enable nuget package restore and also have localdb running. Also open the application and create some departments using application ui.

Next step is to add embedded jsreport server into the visual studio project. Easiest way to do it is to just install `jsreport.Embedded` nuget package.
>Install-Package jsreport.Embedded

After successful installation you can start creating reports. To create a report use a new project item dialog and choose `jsreport report template`. Let's name it `Departments.jsrep` and put it to new `Reports` directory for this purpose.

<a href="http://janblaha.net/img/blog/create-jsrep.png" target="_blank">
<img src="http://janblaha.net/img/blog/create-jsrep.png" alt="create report" style="width: 600px;"/>
</a>

Creating first report will install and start embedded jsreport server. When is everything prepared you should see a main report configuration page.

<a href="http://janblaha.net/img/blog/jsrep-editor.png" target="_blank">
<img src="http://janblaha.net/img/blog/jsrep-editor.png" alt="create report" style="width: 600px;"/>
</a>

You can try to click `Preview` button or hit `F5` to see if everything works. It should open a new tab with `Hello World` pdf inside.

Now let's prepare input data `Departments` report will be generated from. `Contoso University` uses entity framework as data access layer and we will employ it for this. Navigate to `SchoolContext.cs` and add following method and constructors inside.

```csharp
public SchoolContext(string nameOrConnectionString) : base(nameOrConnectionString)
{
}

public SchoolContext()
{
}
        
public object QueryDepartmentsForReport()
{
    return new
    {
        departments = Departments.Include(d => d.Administrator).Select(d => new
        {
            Budget = d.Budget,
            Name = d.Name,
            StartDate = d.StartDate,
            Administrator = d.Administrator.FirstMidName + " " + d.Administrator.LastName,
            Courses = d.Courses
        }).ToList()
    };
}
```

This will load list of departments from local db into anonymous object we will use in the report. Now we need to tell report to use this method as sample data input. Create `ReportingStartup.cs` class in the project and add following content there.

```csharp
public class ReportingStartup
    {
        public void Configure(IVSReportingConfiguration configuration)
        {
            var db = new SchoolContext("Data Source=(LocalDb)\\v11.0;Initial Catalog=ContosoUniversity2;Integrated Security=SSPI;");

            //register dynamic sample data as an action loading data from local db
            configuration.RegisterSampleData("departments", db.QueryDepartmentsForReport);
        }
    }
```

This will tell jsreport extension to register sample data called `departments` for specified c# action. Now navigate back to `Departments.jsrep` and add `departments` sample data into combobox. Also switch engine from [handlebars](http://jsreport.net/learn/handlebars) to [jsrender](http://jsreport.net/learn/jsrender).

![update-jsreport](http://janblaha.net/img/blog/update-jsrep.png)

Now click `Content` button or navigate to `Departments.jsrep.html`. This should open html editor where we will define report layout. Copy there following content.
```html
<h1>Departments report</h1>

<div>
    <table>
        <tr>
            <th>Name</th>
            <th>Administrator</th>
            <th>StartDate</th>
            <th>Budget</th>
        </tr>
        
        {{for departments}}
        <tr>
            <td>{{:Name}}</td>
            <td>{{:Administrator}}</td>
            <td>{{:StartDate}}</td>
            <td>{{:Budget}}</td>
        </tr>
        {{/for}}
    </table>
</div>
```

Hit `F5` and this should print pdf with simple table containing departments.
<a href="http://janblaha.net/img/blog/simple-departments.png" target="_blank">
<img src="http://janblaha.net/img/blog/simple-departments.png" alt="create report" style="width: 600px;"/>
</a>

Now we should fix the date format because it's quite ugly. To do it we will need a javascript helper function. Helper functions are stored in `Departments.jsrep.js` file where you paste following function.

```javascript
function formatDate(date) {
    return moment(date).format("MM-DD-YYYY");
}
```

You can see function using [momentjs](http://momentjs.com/) library to format date. Moment library as well as [underscore](http://underscorejs.org/) library are automatically linked and you can use them without worries.

To use the helper function go back to `html` file and replace column with `StartDate`

```html
 <td>{{:~formatDate(StartDate)}}</td>
```

Hit `F5` and you should see date formatted. Let's do some conditional formatting and mark the highest budget with a red color. Add following helper to do it.

```javascript
function dangerColor(data, currentBudget) {
    var highest = _.max(data, function (d) { return d.Budget; });
    return highest.Budget == currentBudget ? "color:red" : "";
}
```

And also replace budget column with
```html
<td style="{{:~dangerColor(~root.departments, Budget)}}">{{:Budget}}</td>
```

Now let's add a chart into report. The best for charting is to use some third party library like [highcharts](http://www.highcharts.com/). The easiest is to link external library from cdn. To do it add following to the top of the report.

```html
<script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
<script src="//code.highcharts.com/highcharts.js"></script>
```

This will link required libraries to the report and we can try to do a report as in [highcharts example](http://jsfiddle.net/gh/get/jquery/1.9.1/highslide-software/highcharts.com/tree/master/samples/highcharts/demo/pie-basic/).

First add a placeholder for chart
```html
<div class="chart" style="width: 400px; height: 400px;"></div>
```

And then actual chart definition.

```html
<script>
    $(function() {
        var data = [];
        
        {{for departments}}
        data.push(["{{:Name}}", {{:Budget}}]);
        {{/for}}

        $('.chart').highcharts({
            credits: false,
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: 1, //null,
                plotShadow: false
            },
            title: {
                text: null,
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    }
                }
            },
            exporting: {
                enabled: false
            },
            series: [
                {
                    animation: false,
                    type: 'pie',
                    data: data
                }
            ]
        });
    });
</script>
```

Important part of the code is disabling animations otherwise chart will not be printed and second important part is how are the chart data initialized. 

```html
{{for departments}}
data.push(["{{:Name}}", {{:Budget}}]);
{{/for}}
```
We are constructing javascript object using jsrender before the script actually runs. This is because script running inside browser or phantomjs does not have any access to input data, but this trick will make it working. 

After `F5` you can see report looks following.

<a href="http://janblaha.net/img/blog/chart.png" target="_blank">
<img src="http://janblaha.net/img/blog/chart.png" alt="create report" style="height: 450px;"/>
</a>

I think this should be enough for report design. You can [download](https://github.com/jsreport/net/tree/master/examples/ContosoUniversity) full code from github and see other features like headers, child templates or subtemplates. If you are unpatient you can also see final reports at [departments.pdf](http://janblaha.net/img/blog/departments.pdf) and [students.pdf](http://janblaha.net/img/blog/students.pdf).

Now the sample report is ready and we want to provide Constoso University application users ability to generate and download it at request.

To do it we need to start embedded reporting server at asp.net application start. To do it navigate to `Global.asax.cs` and add following.

```csharp
public static IEmbeddedReportingServer EmbeddedReportingServer { get; private set; }

 protected void Application_Start() {
    ...
    EmbeddedReportingServer = new EmbeddedReportingServer(){ RelativePathToServer = "../App_Data"};
    EmbeddedReportingServer.StartAsync().Wait();
    EmbeddedReportingServer.ReportingService.SynchronizeTemplatesAsync().Wait();
}
```

This will extract and run jsreport from `App_Data` folder and also synchronizes all the local `*.jsrep` files with the server on the startup. Last thing we need to do is to extend `DepartmentController.cs` with action rendering report. 

```csharp
[OutputCache(NoStore = true, Duration = 0, VaryByParam = "*")]
public async Task<ActionResult> Report()
{
    var result = await MvcApplication.EmbeddedReportingServer
        .ReportingService.RenderAsync("Departments", db.QueryDepartmentsForReport());
        
    return new FileStreamResult(result.Content, result.ContentType.MediaType);
}
```

Now you can add an action link to the view or just visit `/department/Report` url and the pdf report should popup.