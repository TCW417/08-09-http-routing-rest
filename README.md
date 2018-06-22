![cf](https://i.imgur.com/7v5ASc8.png)    
# Lab 08-09: Vanilla REST API w/ Routing and In Memory Persistence

[![Build Status](https://travis-ci.org/TCW417/08-09-http-routing-rest.svg?branch=master)](https://travis-ci.org/TCW417/08-09-http-routing-rest)

The BOOKS api provides an interface to a database of books. Think of it as your personal reading list.  Books have, at a minimum, title and author properties, with an optional description.

Storage can be configured as transient (RAM only) or persistent (using the server file system) based on the value of STORAGE in the .env file.  The file system storage interface automatically creates the required directories.

The storage interface is object agnostic and can be used to perform CRUD operations on any object in any schema. In this case, the api uses schema named 'Books' and objects with title, author and description properties.  When added to the database, books are given additional properties of _id (a uuid string) and createdOn (an ISO formatted date).

Files created in the test schema are automaticall deleted once tests have completed.

## The API
### GET api/v1/books{?id | title | author }

Returns JSON string representing either a single book (?id=bookId) or array (no query string or title= or author= queries).

Sample return, single object from ?id= query:
```
[
    {
        "_id": "8482aff6-c79a-4c93-896e-1c5cd845dc0a",
        "author": "Larry McMurtry",
        "createdOn": "2018-06-21T16:51:30.564Z",
        "description": "The best book ever!",
        "title": "Lonesome Dove"
    }
]
```
Sample return from GET call to path with title=, author= or no query:
```
[ 
    {
        _id: '38d2295e-954e-4ec9-8e93-47383153b7c4',
        createdOn: '2018-06-21T15:51:41.106Z',
        title: 'title 1',
        author: 'author 1',
        description: '' 
    },
    { 
        _id: 'e5daac7b-d88f-49e2-a165-b0bf26089ebc',
        createdOn: '2018-06-21T15:51:41.106Z',
        title: 'title 2',
        author: 'author 1',
        description: 'descriptions are optional by the way' 
    },
    {
        _id: 'f44cafb0-33a3-4d7c-85fc-d4e559d79b82',
        createdOn: '2018-06-21T15:51:41.106Z',
        title: 'title 3',
        author: 'author 1',
        description: '' 
    }
]
```
Returns status 200 on success, 404 if the requsted resource is not found.

### POST api/vi/books
Creates a new book and adds it to the database.

This route requires a valid book object as a JSON string in the body of the message. For example:
```
{
    "title":"test title",
    "author":"test author"
}
```
or
```
{
    "title":"test title",
    "author":"test author",
    "description":"This is a description of the book"
}
```
Returns status 200 and the full book object, including _id and createdOn properties, as JSON on success, 400 on error. On success the body of the return includes _id and createdOn properties, as:
```
{
     _id: 'f44cafb0-33a3-4d7c-85fc-d4e559d79b82',
    createdOn: '2018-06-21T15:51:41.106Z',
    title: 'test title',
    author: 'test author',
    description: 'This is a description of the book' 
}
```
### PUT api/vi/books
This route updates an existing book. It requires a complete book object as a JSON string as the message body, INCLUDING the _id property, as it will use that _id to locate the resource being updated.

For example, if the following object is retrieved from a previous GET request
```
{
     _id: 'f44cafb0-33a3-4d7c-85fc-d4e559d79b82',
    createdOn: '2018-06-21T15:51:41.106Z',
    title: 'title 3',
    author: 'author 1',
    description: '' 
}
```
and then modified like this
```
{
     _id: 'f44cafb0-33a3-4d7c-85fc-d4e559d79b82',
    createdOn: '2018-06-21T15:51:41.106Z',
    title: 'title 3',
    author: 'author 1',
    description: 'This book really deserves a discription!' 
}
```
the PUT call will succeed and return status 200 with the updated book object as the body of the reply.

If the _id isn't found, status 404 will be returned.

### DELETE api/v1/books?id=bookId
Deletes the book with the given Id. The Id would be taken from a previous GET call.  

On success, returns staus 200 and the message
```
[book title] has been deleted
```

On failure status code 404 is returned.
