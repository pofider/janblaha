{{{
    "title"    : "NHibernate multitenancy in shared database",	
    "date"     : "03-22-2015 14:09",
    "tags"	   : [ ".NET", "NHibernate" ]
}}}

NHibernate still rocks! Even with quite a bit old code base it is still at the top of the c# frameworks we daily use. Especially the framework extensiblity is tremendous. Now I am going to show you how we use NHibernate in the multitenant fashion. 

I think the definition of a multitenant system is quite clear only thing I should point out is the multitenancy data approach we use. Our system uses shared sql schema and shared database for all tenants. With sharding it  gets little bit more complicated but main principle is obvious. Every entity has basically a column `TenantId` which identifies where the particular database rows belongs.

Now lets convince NHibernate to respect our tenant boundaries.

##Implicitly extend queries
One of the important tasks to do when implementing a multitenant systems is to abstract and automate data layer in a way where you don't need to care about multitenancy and it just work out of the box in the most of the cases. For NHibernate it means for example that calling `Session.Query<Invoice>()` returns just invoices from the logged in tenant and not all of them. Explicitly adding where conditions to every query is very error prone and I recommend spend some time and do it correctly.

Fortunately this task can be easily fulfilled using [NHibernate filters](http://ayende.com/blog/3993/nhibernate-filters). This feature allows you to add an extra condition to every sql statement and this is exactly what we want.  The condition in our case should simple equalize  `TenantId` property with the logged in tenant id.


<script src="https://gist.github.com/pofider/3b812311b64b4339844a.js"></script>

Then you can use `hbm.xml` or fluent mapping to add the filter to the every entity.

At the very start of your request, job or any action you just enable the filter as soon you authenticated user and find out the logging in tenant.
```cs
Session.EnableFilter("multitenanct").SetParameter("tenantId", Scope.CurrentTenant.Id);
```

This assures that in every NHibernate query you issue afterwards you get only the data you actually want.


##Implicitly verify all data modifications
The NHibernate filters are great for extending queries but unfortunately it doesn't work with data modifications. This means you can still for example update an entity from another tenant even with the enabled filter what is quite a security hole. This force you to add everywhere a validation that an identifier coming in the update request really belongs to the tenant sending the request. Fortunately it can be solved globally at just one place using another NHibernate hook which is more common to use. I am talking about NHibernate listeners.

The listener can hook into every entity modification action and verify that it is a valid operation for logged in tenant.

<script src="https://gist.github.com/pofider/63ca11bbc1eb3c1d43a2.js"></script>

Not only that filter doesn't limit the update actions but it can even throw exception when you do updates on collections with message `Unable to recreate collection with filter enabled`. For this reason we do flushes without filter enabled and this is done again using the NHibernate listener.
<script src="https://gist.github.com/pofider/6af82ca9a91634293115.js"></script>

##Database schema considerations

The common question when designing database schema for a multitenant system is what should be the primary key and clustered index. In our system the primary keys are composites from the `TenantId` and `Id` in this order. Reflecting such a composite key in NHibernate is quite difficult task and we decided to map NHibernate just for `Id` column and have composite key only in physical database schema. This means we can continue to use `Session.Load<Invoice>(115)` and still have everything consistent in the db.

Although calling `Session.Load` still uses only an uncluttered index on `Id` the performance is quite good. The problem is rather with joining bigger collections where is important to join over the clustered index (`TenantId`, `Id`). Fortunately adding the previously described NHibernate filter on the collection adds the `TenantId` also to the sql joins giving us clustered index to use and great performance. So performance is not an issue in queries with filter any more.

The problem we encountered with such a hybrid primary key was in the database row locks...

```csharp
//select ... from invoice with row lock
Session1.Load<Invoice>(132, LockMode.Upgrade); 

//waiting on lock
Session2.Load<Invoice>(132, LockMode.Upgrade); 

//update Invoice set ... where Id = 132
//deadlock
Session1.SaveOrUpdate(invoice);
```

The trouble is that sql update doesn't work correctly  with row locks when you put just part of the primary key to the where condition and it can very simply cause deadlocks. To make it working correctly the where condition needs to also include `AND TenantId=?`.

NHibernate extensibility comes into game one last time. We use custom entity persister which adds this condition into the updates and we are done.

<script src="https://gist.github.com/pofider/3cae0c423eb084e4bf79.js"></script>

##Summary
NHibernate extensibility is really fabulous and it is a joy to work with it. Using filters, listeners and custom persisters you can adapt NHibernate to work nicely with you multitenant database schema in the very elegant way.



