![cf](https://i.imgur.com/7v5ASc8.png)    
# Lab 08: Vanilla REST API w/ Routing and In Memory Persistence

## Submission Instructions
* Work in a fork of this repository
* Work in a branch on your fork
* Create a PR to your master from your working branch.
* Ensure that your repository/branch is connected to travis-ci.com
* Ensure that your repository/branch is deployed on heroku.com
* Submit on canvas:
  * a question and observation
  * how long you spent
  * link to your pull request that indicates it passed Travis
  * Heroku Server URL

## Configuration 
Configure the root of your repository with the following files and directories. Thoughfully name and organize any aditional configuration or module files.
* **README.md** - contains documentation
* **.env** - contains env variables (should be git ignored)
* **.gitignore** - contains a [robust](http://gitignore.io) `.gitignore` file 
* **.eslintrc** - contains the course linter configuratoin
* **.eslintignore** - contains the course linter ignore configuration
* **.travis.yml** - contains the course linter ignore configuration
* **package.json** - contains npm package config
  * create a `lint` script for running eslint (eslint **/*.js)
  * create a `test` script for running tests
  * create a `start` script for running your server
* **index.js** - the entry point for your application
* **src/** - contains your core application files and folders
* **src/app.js** - (or main.js) contains your core application bootstrap
* **src/lib/** - contains module definitions
* **\_\_test\_\_/** - contains unit tests

## Learning Objectives  
* students will learn to use promise constructs to manage asynchronous code
* students will learn to create a vanilla RESTful API with in-memory persistence
* students will learn how to refactor commonly used coding constructs into custom helper modules

#### Feature Tasks
* create an HTTP server using the native NodeJS `http` module
* create an HTTP server using the native NodeJS `http` module
* create a custom parser module that:
  * uses promises to parse the JSON body of `POST` and `PUT` requests
  * uses the NodeJS `url` and `querystring` modules to parse the request url
* create a router class that allows you to register custom routes for `GET`, `POST`, `PUT`, and `DELETE` requests
* create a data model class that creates a _simple resource_  with at least 3 properties
  * include an `_id` property that is set to a unique id
  * include two additional properties of your choice (ex: name, age, etc.)
  * **Please do not use 'Notes' as your model like lecture code, select a different model with different properties that are NOT title and content**
* create a data model storage interface that can store data through different storage mechanisms.

## Server Endpoints
### `/api/v1/<your-resource>`
* `POST` request
  * pass data as stringifed JSON in the body of a **POST** request to create a new resource
  * SUCCESS: 200 status code with the response body being the retrieved resource with a matching ID
  * FAILURE: 400 for a bad request, i.e. not sending in a required property or not sending any text
* `GET` request
  * pass `?id=<uuid>` as a query string parameter to **GET** a specific resource (as JSON)
  * SUCCESS: 200 status code with the response body being the retrieved resource with a matching ID
  * FAILURE: 404 for resource not found
* `DELETE` request
  * pass `?id=<uuid>` in the query string to **DELETE** a specific resource
  * SUCCESS: 204 status code with no content in the body
  * FAILURE: 404 for resource not found

## Tests
* write a test to ensure that your api returns a status code of 404 for routes that have not been registered
* write tests to ensure the `/api/simple-resource-name` endpoint responds as described for each condition below:
 * `GET`: test 404, it should respond with 'Not Found' for valid requests made with an id that was not found
 * `GET`: test 200, it should contain a response body for a request made with a valid id
 * `POST`: test 400, it should respond with 'Bad Request' if no request body was provided or the body was invalid
 * `POST`: test 200, it should respond with the body content for a post request with a valid body
 * `DELETE`: test 200, it should respond with a 204 status to indicate successful deletion
 * `DELETE`: test 404, it should respond with a 404 status to indicate that resource was not found
 
 ## Bonus Points (up to 3 points)
 * If a querystring id is not passed to the `GET` route, the default behavior should retrieve an array of ID's for each resource stored in the storage module. 
 * `PUT` request
   * pass `?id=<uuid>` in the query string to **UPDATE** a specific resource
   * SUCCESS: 200 status code with the response body being the updated resource
   * FAILURE: 404 for resource not found
   * Test your `PUT` request for 200 and 404 statuses
 * Create a new `GET` route or modify your original `GET` route so that it can accept other query paramters besides an ID, such as `/api/v1/notes?title=hello&content=world`. The behavior of this route should search through your storage module and return an array of all resources matching that criteria. 
 
 ## Documentation
 Add your Travis badge to the top of your README. List all of your registered routes and describe their behavior. Describe what your resouce is. Imagine you are providing this API to other developers who need to research your API in order to use it. Describe how a developer should be able to make requests to your API. Refer to the [PokeAPI docs](https://pokeapi.co/docsv2/#resource-lists) for a good example to follow. 

[![Build Status](https://travis-ci.org/TCW417/08-09-http-routing-rest.svg?branch=master)](https://travis-ci.org/TCW417/08-09-http-routing-rest)

The BOOKS api provides an interface to a database of books. Think of it as your personal reading list.  Books have, at a minimum, title and author properties, with an optional description.

Storage (in this version) is held in memory and is not persistent between server starts and stops.  The memory interface is object agnostic and can be used to perform CRUD operations on any object in any schema. In this case, the api uses schema named 'Books' and objects with title, author and description properties.  When added to the database, books are given additional properties of _id (a uuid string) and createdOn (an ISO formatted date).

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
