{{{
    "title"    : "Builder: great pattern for unit tests",  
    "date"     : "12-03-2013 20:56",
	"tags"	   :[ "architecture", "testing", ".NET" ]
}}}

In the last post it was explained how to prepare unit test hierarchy for writing tests interacting with database. In this post I will concentrate 
on the next step that is preparing database state for test. This mean how to easily insert data required to invoke tested method. I will start 
with example use-case for this post.  Let’s say we need to write tests for a car rental application, especially for creating an order. 
Creating an order involves customer that is creating an order and a car being ordered. Tested logic should create a new order based on the 
input car and a customer. Preparing database for this test means create new car and customer entity in the database. This would mean creating 
these two entities and persist them in the database in the most simply model. But imagine there are other dependencies like car can have a 
not-null reference to engine entity. Than it would require more complicated assembling of entities and that’s place where the builder pattern 
will come very handy.

**The builder feature number one for unit testing is preparing and persisting entities with default values.**

Let’s start with entity builder base class.

``` c#
public abstract class BuilderBase<T>
{ 
    public abstract T Build();

    public T BuildAndWriteToDatabase(ISession session)
    {
        var entity = Build();
        session.SaveOrUpdate(entity);
        return entity;
    }
}
```

There are two public methods as you can see. The Build method should create an entity and BuildAndWriteToDatabase should create 
entity and persist it to database. Now take a look at the concrete entity builder implementation.

``` c#
public class CarBuilder : BuilderBase<Car>
{
    private string _code;
    private Engine _engine;
    private Color _color;

    public CarBuilder(bool setupDefaults)
    {
       if (!setupDefaults)
            return;

       _code = "Skoda";
       _engine = new EngineBuilder(true).Build();
    }

    public override Car Build()
    {
        return new Car(_code, _engine, _color);
    }
}
```

CarBuilder class will help us to create and persist car entity. As you can see it’s accepting bool parameter saying if the builder 
should also prefill properties and dependencies with default values. This will come very handy when you want to just create some car 
entity and don’t care about every little detail or reference. This is the feature number one for entity builders.

**The feature number two for entity builders is nice fluent syntax for modifying just chosen properties when assembling entity from default values.**

Imagine a situation when the tested service responsible for creating order is validating customer state approved and we want to unit 
test this. This would take us extra method to modify state of customer entity after it was created and it would not be very 
easy to read. Let’s take a look at the better approach using entity builder feature number two.

``` c#
public class CustomerBuilder : BuilderBase<Customer>
{
     private string _name;
     private CustomerState _state;
     private string _phone;
     private string _address;

     public CustomerBuilder(bool setupDefaults)
	 {
	     if (!setupDefaults)
             return;

         _name = "Jan Blaha";
		 _state = CustomerState.New;
		 _phone = "00430776271021";
		 _address = "Zitna 84, 1800 Prague";
     }

     public CustomerBuilder WithState(CustomerState state)
     {
         _state = state;
         return this;
     }

     public override Customer Build()
     {
        return new Customer(_name, _state, _phone, _address);
     }
}
```

The trick is in returning object itself from builder methods. This will allow chaining methods and nice fluent syntax. Let’s take a look 
how will the builder usage and the test look like.

``` c#
[Test]
public void should_create_order()
{
  var car = new CarBuilder(true).BuildAndWriteToDatabase(Session);
  var customer = new CustomerBuilder(true).WithState(CustomerState.Approved).BuildAndWriteToDatabase(Session);
  
  _SUT.Execute(car, customer);

  var order = Session.Query<Order>().SingleOrDefault();
  Assert.IsNotNull(order);
}
```

As you can see I am letting builders create whole entities and just override state for customer. This will be very useful for complex 
entities when you need just change some attributes and let the builder assembly the rest with defaults.

##Conclusion

Tests directly interacting with the database can be much easier to read and write than behavioral mock tests in many situations. Tests 
hierarchy will help with accessing the database from tested methods and builders will provide very nice way how to prepare test inputs.