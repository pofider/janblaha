{{{
    "title"    : "Implementing html email notifications",	
    "date"     : "04-10-2015 14:09",
    "tags"	   : [ "jsreport" ]

}}}

The best practice when adding email notifications feature to your system is to separate as much as you can from email body assembling to email sending outside of the core system. The emails templates quite likely often changes and you don't want to deploy the system because of every single notification change. The best is to just separate everything into an external system and give the access to your PR or Marketing department so they change emails as the time goes without affecting the core system.

[jsreport](http://jsreport.net) reporting server is so flexible it can even fulfill the purpose of email notifications server. It provides email template browser based designer as well as email sending capability and simple REST API. 

In this tutorial I explain how use jsreport to design, store and send email notifications. I won't explain every single detail of jsreport in this article so if you never used it before, rather check its [get started](http://jsreport.net/learn) first.

Let's assume for this tutorial you want to send simple notification to the user when he creates an account in a core system. The notification should contain a welcome message and information about the created account. The notification sending is triggered from the core system using [jsreport API](http://jsreport.net/learn/api) and contains required input data like receiver email or user information.

##Prepare sample input data

Email notification assembling and sending will be triggered using jsreport API in production deployment. However during design time it is convenient to prepare some sample inputs to mock the actual API call. This is achieved using jsreport [data extension](http://jsreport.net/learn/inline-data) just inside jsreport studio. So let's open jsreport studio and define some required inputs we will use in the email body.

![mock input data](http://janblaha.net/img/blog/email-notifications-data.png)

##Prepare template with email content

Now it's time to design desired body of the email notification. This is done in the jsreport studio integrated designer. To open the designer create jsreport `template` and then select in the left menu sample data you previously created and switch to [html recipe](http://jsreport.net/learn/html) and [jsrender templating engine](http://jsreport.net/learn/jsrender).

![email designer](http://janblaha.net/img/blog/email-notifications-playground.png)

jsreport uses [javascript templating engines](http://jsreport.net/learn/templating-engines) to dynamically assemble content like html. This gives you the full power to create any output you can think of however for email notifications just simple usage should be enough.

This example's template should contain a basic welcome message and user credentials. To assemble such a html email you just need to use simple binding. For [jsrender](http://jsreport.net/learn/jsrender) templating engine it can look as follows:
```html
<h1>Dear {{:fullname}}</h1>
your credentials are:</br>
username: {{:username}}</br>
password: {{:password}}
```
Where the syntax `{{:fullname}}` is used to replace the value from the sample data you provided or later to replace the valua from data specified in the API call.

You can now use the jsreport studio designer to preview the email body output until you are satisfied with it.


##Prepare script sending email

You should have the jsreport template with email body prepared. Now it is time to define the [custom script](http://jsreport.net/learn/scripts) which will actually send the email. Such a script can be created in the jsreport studio and then associated with the email template.

![email designer](http://janblaha.net/img/blog/email-notifications-script.png)

The following snippet shows the script implementation using [SendGrid](https://sendgrid.com/) email cloud service, but note you can use your smtp as well.
<script src="https://gist.github.com/pofider/1f7b5abc80d6f29e5b4e.js"></script>

Please later [visit the documentation](http://jsreport.net/learn/scripts) to get better understanding of the custom scripts and what you can achieve with it. For  now you can just copy paste the snipped.

When the script is ready you have to associate the script with the created template. Running the template preview afterwards will always send the email and you can verify the final output.

##Call jsreport API 

Everything should be prepare now and you can integrate jsreport notifications into the core system. Integration is very simple and you just need to do a single API call to jsreport server to invoke email rendering. The request should look in the following way:

> `POST:` https://jsreport-host/api/report    
> `Headers`: Content-Type: application/json    
> `BODY:`    
>```js 
   { 
      "template": { "shortid" : "g1PyBkARK" },
      "data" : {
		  "fullname": "...",
	      "username": "...",
	      "password": "...",
	      "email": "...."
      }
   } 
>```


##Further improvements
In the more complex scenarios there will be many templates for email notifications and in this case you can use jsreport [child templates](http://jsreport.net/learn/child-templates) to share parts of the templates between each other. To localize the emails you can look at jsreport [resources](http://jsreport.net/learn/resources) extension. Or just check all of the extension right now and use whatever you like. 

##Summary
jsreport helps developers to achieve various goals they used to be painfully fulfilling. One of such a goal is email notification feature which can be easily separated from the core system and "outsourced" into the jsreport server. jsreport designer and permission system can be then used to modify email notifications on the fly by the responsible persons without affecting the core system. 