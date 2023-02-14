![GitHub package.json version](https://img.shields.io/github/package-json/v/oaspub/windrunner)

# WindRunner

A highly-opinionated Node.js web server framework for building fast, secure, and scalable microservices and clients.

## Why WindRunner?

To encourage well-defined encapsulation, re-usability of code, and developer agility in fulfilling business processes
and needs. There are many other great web server frameworks in the Javascript community, but none of them are nearly as
opinionated as WindRunner. WindRunner allows engineers to focus on controller development by building in best practices
of API architecture as recommended by these sources:

- **Implementing Domain-Driven Design** by Vaughn Vernon
- **Domain-Driven Design: Tackling Complexity in the Heart of Software** by Eric Evans
- **Anemic Domain Model** by Martin Fowler

WindRunner applies these principles so that engineers start thinking first about the resources in terms of entities,
relationships, and commands. As a result of that forethought, the entire domain design is unravelled and documented
without duplicating work between development and documentation.

## A Note About Decorators

WindRunner requires the use of metadata reflection and decorators. Support for decorators as outlined in the ECMAScript
Stage 3 proposal
is [available in TypeScript v5](https://www.typescriptlang.org/docs/handbook/decorators.html#introduction).

## Controllers

WindRunner expects a controller object whose properties are functions that handle server requests. A controller should
only interact with one resource.

### Controller Decorators

The functions on the controller object _should_ be decorated with the type of action they represent. These decorators
replace the function with a new function that can be handed the IncomingRequest and ServerResponse objects that a Node
Server expects in its createServer implementation. They provide request and response validation based on the
controller's resource. The signatures in the table below represent the shape of the function expected by each decorator.
The implementation of the controller methods should extend the signature in the table.

| :Decorator: | :Signature:                                                                   | :Description:                                                                                                                                                                                                                                                                                                                                                                                                                          |
|-------------|-------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| @find       | ```ts (keys: Record<string, unknown>) => Resource```                          | Finds a resource instance. The method accepts an object of data representing the key(s) that uniquely identify the resource instance to be found. It must return only one resource instance. If nothing is returned, a status code of 404 is automatically inferred and an empty response body is sent. The HTTP method for the request is a `GET` on the instance path.                                                               |
| @filter     | ```ts (queries: Record<string, unknown>) => Resource[]```                     | Filters the collection of resource instance. The method may accept an object of data representing the query parameters for filtering the collection. It must return an array of items and an optional cursor representing the next item to query. If nothing is returned, an empty list is automatically sent to the requester. The HTTP method for the request is a `GET` on the resource path.                                       |
| @create     | ```ts (data: Resource) => Resource```                                         | Creates a new resource instance. The method accepts an object of the required properties on the resource class. Optional properties are also accepted. It must return the newly created resource. The HTTP method for the request is a `POST` on the resource path.                                                                                                                                                                    |
| @replace    | ```ts (keys: Record<string, unknown>, data: Resource) => Resource```          | Replaces the resource instance. The method accepts an object of data representing the key(s) that uniquely identify the resource instance to be replaced. It also accepts an object of data representing the new data to replace the existing. The HTTP method for the request is a `PUT` on the instance path. The method must return the replaced resource.                                                                          |
| @modify     | ```ts (keys: Record<string, unknown>, data: Partial<Resource>) => Resource``` | Modifies the resource instance. The method accepts an object of data representing the key(s) that uniquely identify the resource instance to be replaced. It also accepts an object of data representing the new data to update the existing. The HTTP method for the request is a `PATCH` on the instance path. The method must return the updated resource.                                                                          |
| @remove     | ```ts (keys: Record<string, unknown> => void```                               | Removes the resource instance. The method accepts an object of data representing the key(s) that uniquely identify the resource instance to be deleted. The HTTP method for the request is a `DELETE` on the instance path. It should return undefined even. When no resource is found matching the one indicated in the request, the method should still return undefined. The status code will be 202 (Accepted) with an empty body. |

## Resources

The fundamental construct of WindRunner is a resource. The shape of the resource properties are defined with TypeBox.
Additional metadata may be applied to the resource properties by using [resource decorators](#resource-decorators).

A resource controller exercises sole dominion over the resource. It must not manage any other resources. Multiple
resources may be managed within the same WindRunner instance if necessary, but it is not recommended for the sake of
development agility, encapsulation, and code simplicity.

> WindRunner expects resources defined using [TypeBox](https://github.com/sinclairzx81/typebox), a JSON Schema type
> builder with validators and static type resolution for TypeScript. TypeBox validators
> are [probably the fastest JSON Schema type validation available](https://github.com/sinclairzx81/typebox#benchmark).

Resource paths are based on the name of the resource converted to its lowercase, plural form. For example, if the name
of the resource was "Person", the path to the resource would be "/persons".

### Resource Decorators

| :Decorator: | :Description:                                                                                                                                   |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| @key        | Establishes the parameter(s) to query a single resource instance. The parameter will be located in the path (e.g. `/resource/<prop1>,<prop2>`). |
| @sortable   | Allows the collection of resource instances to be sorted by the property. Effectively, it allows the query `?sort=<prop1>,<prop2>`.             |                                                                                              |

If a property is read-only, it will be omitted from the request and required in the response.

### Responses

Responses can take various forms, but they all align with the shape of the resource schema.

Non-error responses will:

1. Return one resource instance,
2. Return a collection or resource instances, or
3. Return empty

Resource controller methods may throw errors in the following forms:

1. a number representing a status code.
2. a http error object containing the status code and an optional data object containing additional data to return to
   the requesting client.

### The single resource instance response

The WindRunner instance must return one instance matching the shape of the provided schema for the endpoint for:

1. using the get method to retrieve a single resource
2. using a put method to replace a resource (the new state of the resource is returned)
3. using a patch method to modify a resource (the new state of the resource is returned)
4. using a post method to create a resource

### The collection of resource instances response

The WindRunner instance must return an array of resource instances matching the shape of the provided schema for the
endpoint for:

1. using the get method to narrow the available resources using filters

Collection responses also return an `x-cursor` header which may be used to fetch the next set of results. If no such
header is found, then the current response represents the end of the list.

The `nextToken` is an encrypted hash of metadata required for the server to deliver the next set of resources. Tampering
with it will result in a 400 (Bad Request) response with request validation requirements.

### The empty response

The WindRunner instance may return an empty response for any error thrown by the resource controllers. An error that
cannot be understood will also return a status code of 500 and an empty body. Additionally, successful responses may
return empty for:

1. deletion requests that were processed successfully
