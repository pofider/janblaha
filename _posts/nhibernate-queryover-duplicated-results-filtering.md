{{{
    "title"    : "NHibernate QueryOver duplicated results filtering",  
    "date"     : "05-10-2014 22:22",
	"tags"	   :[ ".NET", "NHibernate" ],
	"preview"  : "NHibernate has very powerful syntax for doing sql queries. It's `QueryOver` syntax is the biggest reason for using NHibernate instead of Entity Framework for me."
}}}

##Problem
NHibernate has very powerful syntax for doing sql queries. It's `QueryOver` syntax is the biggest reason for using NHibernate instead of Entity Framework for me. It's dificult to start with it but once you master it you can do almost every query. We have hundreds of very complicated queries in our application and still using only `QueryOver` without `HQL`. The problem is with power comes also complexity and issues. Issue we were facing with `QueryOver` was duplications in the result entity list. This was happening when the query contained joins on properties with many-to-many relationships. The generated sql statement was all right but parsing the result set form db was producing duplications.

##Solution

Luckily NHibernate power lays in various extension points it provides. One of them is the hook for transforming entity tree just after parsing them from db result set. This hook can be added using `TransformUsing` method. This method accepts `IResultTransformer` interface which is offering hooks to entity transformation process. So we will do the hard job for nhibernate and crawl entity tree and remove all duplications. We need avoid stepping into properties that are no fetched yet. It is also important to clear nhibernate dirty flag on collections otherwise it will try to sync it back with the db.

Here is final code we use:
```c#
public class DistinctIdTransformer : IResultTransformer
{
    public object TransformTuple(object[] tuple, string[] aliases)
    {
        return tuple.Last();
    }
    
    public IList TransformList(IList list)
    {
        if (list.Count == 0)
            return list;
        var result = (IList)Activator.CreateInstance(list.GetType());
        var distinctSet = new HashSet<EntityBase>();
        foreach (object item in list)
        {
            var entity = item as EntityBase;
            if (entity == null)
                continue;
            if (distinctSet.Add(entity))
            {
                result.Add(item);
                HandleItemDetails(item, new HashSet<EntityBase>());
            }
        }
        return result;
    }

    private void HandleItemDetails(object item, HashSet<EntityBase> processed)
    {
        var entity = item as EntityBase;
        if (!processed.Add(entity) || item == null)
            return;

        foreach (PropertyInfo property in item.GetType().GetProperties())
        {
            if (ImplementsBaseType(property.PropertyType))
            {
                HandleCollection(item, processed, property);
                continue;
            }
        }
    }

    private void HandleCollection(object item, HashSet<EntityBase> processed, PropertyInfo property)
    {
        dynamic detailList = property.GetValue(item, null);
        
        //avoid lazy loading here
        if (!NHibernateUtil.IsInitialized(detailList))
            return;

        if (detailList != null)
        {
            var distinct = new HashSet<EntityBase>();
            var isDirty = false;
            foreach (var subItem in detailList)
            {
                var subEntity = subItem as EntityBase;
                if (distinct.Add(subEntity))
                {
                    HandleItemDetails(subEntity, processed);
                }
                else
                {
                    isDirty = true;
                }
            }

            if (!isDirty)
                return;

            detailList.Clear();

            foreach (var subItem in distinct)
            {
                detailList.Add(subItem);
            }
            
            //this is important to tell nhibernate it should not generate any udates
            detailList.ClearDirty();
        }
    }

    public static bool ImplementsBaseType(Type t)
    {
        int found = (from i in t.GetInterfaces()
                     where i.IsGenericType &&
                           i.GetGenericTypeDefinition() == typeof(IEnumerable<>) &&
                           typeof(EntityBase).IsAssignableFrom(i.GetGenericArguments()[0])
                     select i).Count();
            return (found > 0);
    }
}
```

Now you can add DistinctIdTransformer to `QueryOver` and hopefully you will not get duplications anymore.
```c#
 Session.QueryOver<Contact>(() => alias).TransformUsing(new DistinctIdTransformer());
```