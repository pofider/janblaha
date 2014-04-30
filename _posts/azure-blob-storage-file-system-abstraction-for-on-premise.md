{{{
    "title"    : "Azure Blob Storage file system abstraction for on premise",  
    "date"     : "04-30-2014 16:40",
	"tags"	   :[ ".NET", "Azure", "architecture" ]
}}}

> Whole project is stored on [github](https://github.com/pofider/AzureBlobFileSystem)

Our current project is SaaS with the requirement to run also on premise. We need to store reports for thousands of tenants therefore we are using Azure Blob Storage. That works fine for Azure cloud based SaaS application. However we cannot use Azure Blob Storage on premise because our clients run on their servers without internet connection and do not want to store data in the cloud. Therefore I have created file system abstraction that can run against Windows Azure Storage as well as local hard drive. 

Idea is very simple. Use one file system interface in whole your application and just choose the right implementation (Azure Blob Storage or File System) on startup. The file system interface and proper implementations can be downloaded from nuget. 

>PM> Install-Package BlobFileSystem.Azure

This is how you create particular implementation of the file system interface:
``` c#
//storage using azure blob client
IStorageProvider azureStorage = new AzureBlobStorageProvider(CloudStorageAccount.DevelopmentStorageAccount);

//storage using fileSystem
IStorageProvider fileSystemStorage = new FileSystemStorageProvider();
```

Then you can call `IStorageProvider` interface methods and create folders in the same way for the file system or azure storage. Checkout [github](https://github.com/pofider/AzureBlobFileSystem) for detail description.

The best it to put the correct imlementation to the dependency injection container and then you don't need to care about anything.

``` c#
IStorageProvider storage;

if (ConfigurationManager.AppSettings["useFileSystem"] == "true")
    storage = new FileSystemStorageProvider();
else 
    storage = new AzureBlobStorageProvider(CloudStorageAccount.Parse(""));

Container.RegisterInstance(storage).As<IStorageProvider>().SingleInstance();
```



