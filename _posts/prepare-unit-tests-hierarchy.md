{{{
    "title"    : "Prepare unit tests hierarchy",  
    "date"     : "03-18-2013 20:56",
	"tags"	   :[ "architecture", "testing" ]
}}}

In the last post was proposed using state testing rather than behavior mock testing when it’s not necessary. This means testing results of methods 
is most of the time much more convenient and I would recommend using mocks only when it’s necessary. But what about interaction with 
other components like database or file system? It’s usually way easier to just insert test data to  the database than to mock whole 
layer. Only little problem is that the database must be prepared before the test is running and the concurrent tests should not 
affect each other. The solution for this is to have a good infrastructure.

I prefer to have infrastructure for tests interacting with the database based on class hierarchy. If I want to create a new test 
interacting with the database I just need to inherit from correct class and whole magic is done in base. The very top base 
class for tests accessing database should be responsible to recreate the database once and initialize ORM session for every test 
method. It can look like following class.

``` c#
[TestFixture]
public class where_test_access_database
{
    protected ISession Session;

    //run just once, this is time consuming
    static where_test_access_database()
    {
        //drop database.. I prefere to use script
        //create schema.. I prefere to use ORMs code first methods
    }

    [SetUp]
    public void where_test_access_database_setUp()
    {
        //get NH Session or EF Object Context
        Session = InjectionContainer.Instance.Resolve<ISession>();
    }

    [TearDown]
    public void where_test_access_database_tearDown()
    {
         //release all resources
         Session.Dispose();
    }
}
``` 

Most of the tests will be probably working with the same database and could affect each other. Therefor I prefer to run tests in 
the database transaction so they are isolated from each other. Let’s introduce another base class for this that is providing 
transactional behavior for tests.

``` c#
[TestFixture]
public class when_test_running_in_transaction : where_test_access_database   
{      
   [SetUp]
   public void when_test_running_in_transaction_setUp()
   {
     Session.Transaction.Begin(); 
   }
   
   [TearDown]
   public void when_test_running_in_transaction_tearDown()
   {
     Session.Transaction.Rollback();
   }
}
```

Every single test method in class inheriting from `when_test_running_in_transaction` will have easy access to the database and it’s work will 
not affect other tests. You can continue this way and create another test base classes that will help you easier implement specific 
test types like persistence tests and so on.

In the next post I will show you some good tips for easier preparing and inserting test data to database.