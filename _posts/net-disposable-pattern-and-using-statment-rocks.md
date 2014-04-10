{{{
    "title"    : ".NET disposable pattern and [using] statment rocks",  
    "date"     : "02-17-2013 14:56",
	"tags"	   :[ ".NET" ]
}}}

I remember the first time I saw the using statement in c#. It was actually used when reading file content.

``` c#
using (var fileReader = new StreamReader(new FileInfo("filePath").OpenRead()))
{
}
```

I was very disappointed by this structure because it’s a lot of coding afford for something that could be done automatically. 
Why not to close file and release resources automatically when the file is garbage collected? But when I rethought this I 
realized that waiting for garbage collection does not need to be a good idea in many cases and .net disposable pattern is 
just great. It can be actually used in plenty other situations when you need to make sure that some finalizing work is done 
after main part is executed. 

Last week I needed to solve the problem of running some parts of thread in different culture. It was a situation when 
I needed to send email to collection of users with the text in the preferred language. Because of using standard .net 
resources, the easiest way was to change current thread culture to user’s preferred one and let the .net resources do 
their job and get the correct language strings. The original culture should be obviously stored and switched back so the 
next code execution would not be affected by culture changes. This is a very nice example of [using] statement usage. 
Let’s take a look at the code.

``` c#
foreach (var user in users)
{
    using (new LocalizedScope(user.PreferedCulture))
    {
         //get resources and send emails
    }
}
```

This was easy. We will switch to prefered culture for every user, take localized resources and switch the culture back after 
we are done. LocalizedScope implementation than look like this.

``` c#
public class LocalizedScope : IDisposable
{
    private string _storedCulture;

    public LocalizedScope(string preferedCulture)
    {
        _storedCulture = Thread.CurrentThread.CurrentCulture.Name;

        Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture(preferedCulture);
        Thread.CurrentThread.CurrentUICulture = CultureInfo.CreateSpecificCulture(preferedCulture);
    }

    public void Dispose()
    {
        Thread.CurrentThread.CurrentCulture = CultureInfo.CreateSpecificCulture(_storedCulture);
        Thread.CurrentThread.CurrentUICulture = CultureInfo.CreateSpecificCulture(_storedCulture);
    }
}
```

##Conclusion

The Disposable pattern and using statment is not there only for .net core libraries and streams. There are plenty of situations where 
you can use it and make your code much more readable. Use it loudly and proudly, it will identify the quality of your code immediately.