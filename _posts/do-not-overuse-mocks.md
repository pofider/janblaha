{{{
    "title"    : "Do not overuse mocks",  
    "date"     : "03-10-2013 14:56",
	"tags"	   :[ "architecture", "testing" ]
}}}

Using mocks and behavior testing is a great idea. Especially when you are dealing with complicated dependencies and business logic. But some 
people tend to use it also for very simple scenarios like CRUD operations. In my opinion even for middle sized projects there is no need to 
have more than 10% of behavior mocking tests. Typical business scenario that I am talking about can be following:

-  Simply query data from the database
-  Calculate and update some values
-  Save back to the database

Mocking approach would introduce something like repository pattern. Than inject repository mock to the service and stub query and expect 
appropriate save. This will bring a lot of unnecessary abstraction to the code like repository interfaces. In the end the test will actually 
test only that the repository is invoked. I know there is usually a persistent test verifying that entity is correctly mapped to the 
database, but this is usually not enough. There are many pitfalls when you are using some sophisticated ORM framework that will just 
not be covered with persistence test and repository behavioral testing. I have seen many times situation where thousands of mocking tests 
where green and application was not even successfully starting.

Therefor my proposal is to rather test results and use mocks and behavior testing only when it’s necessary. Ideal way for testing previous scenario 
would be than just insert necessary entities to database, let the testing method do its job and verify database state afterwards.

I will try to give you some tips and examples for writing readable interacting tests in the next two posts.

-  Prepare unit tests hierarchy
-  Using builders to prepare test inputs