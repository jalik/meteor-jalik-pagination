# Pagination

A file system store for UploadFS.

### Installation

To install the package, execute this command in the root of your project :
```
meteor add jalik:pagination
```

If later you want to remove the package :
```
meteor remove jalik:pagination
```

### Create a Pagination

First, you must prepare a subscription that takes filters and options.
**The example below is imcomplete and not secured**, you have to do some checks to restrict filters and options.

```js
if (Meteor.isServer) {
    Meteor.publish('users', function (filters, options) {
        check(this.userId, String);
    
        // Prepare filters
        filters = _.extend({
            // set default filters here
        }, filters, {
            // overwrite the filters here
        });
    
        // Prepare options
        options = _.extend({
            sort: {username: 1},
            skip: 0,
            limit: 10
        }, options);
    
        return Meteor.users.find(filters, options);
    });
}
```

Then on the client, you can setup the pagination.

```html
<template name="users">
    <div>
        <ul>
        {{#each users}}
            <li>User: {{username}}</li>
        {{else}}
        </ul>
        
        <!-- Insert the pagination named userList -->
        {{> pagination id="userList"}}
    </div>
</template>
```

```js
Template.users.onCreated(function () {
    var tpl = this;

    // Create the query cursor
    tpl.users = function () {
        return Meteor.users.find({}, {
            sort: {username: 1}
        });
    };

    // Create the pagination named userList
    tpl.pagination = new Pagination('userList', {
        cursor: tpl.users(),
        skip: 0,
        limit: 10
    });

    tpl.autorun(function () {
        tpl.subscribe('users', {}, {
            // Be sure to pass the same sorting option as above
            // otherwise the results will only be sorted on the client.
            sort: {username: 1},
            // getLimit() and getSkip() are reactive so if they change,
            // a new subscription is triggered.
            limit: tpl.pagination.getLimit(),
            skip: tpl.pagination.getSkip()
        });
    });
});

Template.users.helpers({
    users: function () {
        // Return the query cursor
        return Template.instance().users();
    }
});
```

### Customizing

```js
// Set the default text value for all pagination buttons
Paginations.buttons = {
    first : 'First',
    next : 'Next',
    Previous : 'Previous'
};

```html
<template name="users">
    <div>
        <!-- Use custom mode to display elements as span and stylize them with CSS -->
        {{> pagination id="userList" mode="custom"}}
    </div>
</template>
```