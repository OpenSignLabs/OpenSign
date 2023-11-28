
# OpenSign API v1

This is the initial beta v1 API to get information from OpenSign.

The base URL for all API calls will be based on value set during installation.

For example we will use for localhost i.e.
```
http://127.0.0.1:8080/app
```

## API Reference

**Prerequisites**
- Need to generate the application token by visiting the frontend URL i.e. http://localhost:3000/api
- Application Id: It is available in http://localhost:3000/api page

**Application Token Format**: opensign.XXXXXXXXXXXXX

Note: Application Token is required in all API calls.

#### Get User Details

```http
  POST /functions/v1
```
| Header | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `X-Parse-Application-Id` | `string` | **Required**. Your Application Id |


| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `action` | `string` | **Required**. Value: getUser |
| `appToken` | `string` | **Required**. Application Token |


Example:

cURL:

```
curl  -X POST \
  'http://127.0.0.1:8080/app/functions/v1?appToken=opensign.2nibUapqVI8mgPPfiLeZ7P&action=getUser' \
  --header 'Accept: */*' \
  --header 'X-Parse-Application-Id: opensignstgn'
```

PHP

```
<?php

$client = new http\Client;
$request = new http\Client\Request;

$request->setRequestUrl('http://127.0.0.1:8080/app/functions/v1');
$request->setRequestMethod('POST');
$request->setQuery(new http\QueryString([
  'appToken' => 'opensign.2nibUapqVI8mgPPfiLeZ7P',
  'action' => 'getUser'
]));

$request->setHeaders([
  'Accept' => '*/*',
  'X-Parse-Application-Id' => 'opensignstgn'
]);

$client->enqueue($request)->send();
$response = $client->getResponse();

echo $response->getBody();
```

NodeJs

```
var axios = require("axios").default;

var options = {
  method: 'POST',
  url: 'http://127.0.0.1:8080/app/functions/v1',
  params: {appToken: 'opensign.2nibUapqVI8mgPPfiLeZ7P', action: 'getUser'},
  headers: {
    Accept: '*/*',
    'X-Parse-Application-Id': 'opensignstgn'
  }
};

axios.request(options).then(function (response) {
  console.log(response.data);
}).catch(function (error) {
  console.error(error);
});
```


#### Get Documents Report

```http
  POST /functions/v1
```
| Header | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `X-Parse-Application-Id` | `string` | **Required**. Your Application Id |


| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `action` | `string` | **Required**. Value: getDocuments |
| `appToken` | `string` | **Required**. Application Token |
| `docType` | `string` | **Required**. Type of Report |
| `limit` | `string` |  Number of documents |


The different values accepted by `docType` are:
- draft
- signatureRequest
- signatureSent
- signatureComplete
- expiredDocument
- declinedDocument
- inProgressDocument
- selfSignatureDocument

Example:

To fetch the draft documents list:

cURL:
```
curl  -X POST \
  'http://127.0.0.1:8080/app/functions/v1?appToken=opensign.2nibUapqVI8mgPPfiLeZ7P&action=getDocuments&docType=draft&limit=1' \
  --header 'Accept: */*' \
  --header 'X-Parse-Application-Id: opensignstgn'
```

PHP:
```
<?php

$client = new http\Client;
$request = new http\Client\Request;

$request->setRequestUrl('http://127.0.0.1:8080/app/functions/v1');
$request->setRequestMethod('POST');
$request->setQuery(new http\QueryString([
  'appToken' => 'opensign.2nibUapqVI8mgPPfiLeZ7P',
  'action' => 'getDocuments',
  'docType' => 'draft',
  'limit' => '1'
]));

$request->setHeaders([
  'Accept' => '*/*',
  'X-Parse-Application-Id' => 'opensignstgn'
]);

$client->enqueue($request)->send();
$response = $client->getResponse();

echo $response->getBody();
```

NodeJs:
```
var axios = require("axios").default;

var options = {
  method: 'POST',
  url: 'http://127.0.0.1:8080/app/functions/v1',
  params: {
    appToken: 'opensign.2nibUapqVI8mgPPfiLeZ7P',
    action: 'getDocuments',
    docType: 'draft',
    limit: '1'
  },
  headers: {
    Accept: '*/*',
    'X-Parse-Application-Id': 'opensignstgn'
  }
};

axios.request(options).then(function (response) {
  console.log(response.data);
}).catch(function (error) {
  console.error(error);
});
```
