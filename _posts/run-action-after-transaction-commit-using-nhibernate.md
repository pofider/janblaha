{{{
    "title"    : "Run action after transaction commit using NHibernate",  
    "date"     : "05-10-2014 20:55",
	"tags"	   :[ ".NET", "NHibernate" ],
	"preview"  : "One of the session/transaction handling technique in NHibernate is called `session/transaction per request`. The name of this technique is self explanatory. "
}}}

##Problem
One of the session/transaction handling technique in NHibernate is called `session/transaction per request`. The name of this technique is self explanatory. You open a transaction and session when request comes to the application and commits and dispose transaction at the end of the request. This is very popular for web applications where you expect short running requests. This makes the development easier since you don't need to care about the session and transaction scopes. But there are cases where you actually care about the transaction scope and want to invoke some custom action after the transaction is committed. This can be for example submitting a message to azure service bus or calling another system. You can oppose that you should employ distributed transactions for this. But actually azure sevice bus for example does not support DTS and in many other cases it's just not necessary and overhead using DTS. 

##Implementation
You can use http context to store an information what you want to do at the end of the request but this is just ugly and better is to use what NHibernate offers. NHibernate `Transaction` class exposes method `RegisterSynchronization`. This method can be used to register for transaction events and accepts implementation of `ISynchronization` interface. You only need to implement methods `BeforeCompletion` and `AfterCompletion` and you are done.

Basic implementation of `ISynchronization` invoking custom action after transaction commit can look following:
```csharp
public class TransactionSynchronization : ISynchronization
{
    private readonly Action _action;

    public TransactionSynchronization(Action action)
    {
        _action = action;
    }
    
    public void BeforeCompletion()
    {

    }

    public void AfterCompletion(bool success)
    {
        if (success)
            _action();
    }
}
```
When you have `TransactionSynchronization` you can just call `RegisterSynchronization` and register any custom action you want.

```csharp
Session.Transaction.RegisterSynchronization(new ThreadSynchronization(() => {
    var client = new HttpClient()
    ...
}));
```                