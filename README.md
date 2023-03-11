# Async HTTP API Lambda Layer
This is a lambda layer package that allows you to return data from your http API before your `ASYNC_HANDLER` has finished executing.

This allows you to perform fire and forget http APIs similar to the old `X-Amz-Invocation-Type: Event` that is [enabled on v1 APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-integration-async.html).

## How to use
This repository is basically an example repo showing how to deploy and integrate with this async handler.

Each function in the `serverless.yml` file presents a different way to interact with the layer.

* `longRunning` - This function demonstrates an ASYNC handler that runs way after a typical HTTP API would be required to return a response. It is also using the built in layer `proxy` handler that will take care of passing the `event` and `context` object to the async handler.
* `customResponse` - This function demonstrates an async handler that uses the built in layer `proxy` handler and customizes the response message.
* `customHandler` - This function demonstrates a custom handler paired with an `ASYNC_HANDLER`. This also demonstrates how to use the `sendArgs` method exposed by our layer.

## Layer details
This layer includes an external extension that is monitoring for an http event from the internal lambda function that forwards the event and context information. It also includes a lambda handler you can use to send quick responses back to API gateway as well as a `sendArgs` method that allows you use a custom handler.

Once the event and context information is received the extension will then execute the `ASYNC_HANDLER` function supplied in our environment variables.

## Environment variables

| Name | Description | Required (Y/N) | Default |
|--|--|--|--|
| `ASYNC_HANDLER` | This is the path to your async handler. This is similar to the normal `handler` property in the function description in the `serverless.yml` file. | `Y` | N/A |
| `CUSTOM_RES` | If you want to use the built-in `proxy` handler but you would like to customize the http response you can do that via this variable. (Example on `customResponse` function 😉) | `N` | N/A |
