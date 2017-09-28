//
// Copyright 2017 Amazon.com, Inc. or its affiliates (Amazon). All Rights Reserved.
//
// Code generated by AWS Mobile Hub. Amazon gives unlimited permission to
// copy, distribute and modify it.
//

'use strict';
console.log("Loading function");

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

exports.handler = function(event, context, callback) {
    var AWS = require('aws-sdk');
    var docClient = new AWS.DynamoDB.DocumentClient();
    var responseCode = 200;
    var requestBody, pathParams, queryStringParams, headerParams, stage,
    stageVariables, cognitoIdentityId, httpMethod, sourceIp, userAgent,
    requestId, resourcePath;
    
    console.log("request: " + JSON.stringify(event));

    // Request Body
    requestBody = event.body;

    if (requestBody !== undefined && requestBody !== null) {

        // Set 'test-status' field in the request to test sending a specific response status code (e.g., 503)
        responseCode = JSON.parse(requestBody)['test-status'];
    }

    // Path Parameters
    pathParams = event.path;

    // Query String Parameters
    queryStringParams = event.queryStringParameters;
    
    console.log("query: " + queryStringParams);

    // Header Parameters
    headerParams = event.headers;

    if (event.requestContext !== null && event.requestContext !== undefined) {

        var requestContext = event.requestContext;

        // API Gateway Stage
        stage = requestContext.stage;

        // Unique Request ID
        requestId = requestContext.requestId;

        // Resource Path
        resourcePath = requestContext.resourcePath;

        var identity = requestContext.identity;

        // Amazon Cognito User Identity
        cognitoIdentityId = identity.cognitoIdentityId;

        // Source IP
        sourceIp = identity.sourceIp;

        // User-Agent
        userAgent = identity.userAgent;
    }

    // API Gateway Stage Variables
    stageVariables = event.stageVariables;

    // HTTP Method (e.g., POST, GET, HEAD)
    httpMethod = event.httpMethod;

    // TODO: Put your application logic here...
    if (httpMethod == 'GET') {
        
        // First verison will be to get all schedules of a certain user
        var params = {
            TableName : "treatmenttracker-mobilehub-798355782-Schedule",
            KeyConditionExpression: "#usr = :CogId",
            ExpressionAttributeNames:{
                "#usr": "userId"
            },
            ExpressionAttributeValues: {
                ":CogId":cognitoIdentityId
            }
        };

        console.log(JSON.stringify(params, null, 2));
    
        docClient.query(params).promise()
            .then(data => {
                console.log("Query succeeded.");
                console.log("response: " + JSON.stringify(data))
            
                // extracts data for a specific date
                var targetDate = queryStringParams.Date;
                console.log("date: " + targetDate);
                var result = [];
                
                if (data.Count > 0 )
                {
                    console.log("items count: " + data.Count)
                    data.Items.forEach(function(item) {
                        console.log("comparing with: " + item.Date);
                        if(item.Date == targetDate) {
                            result.push(item);
                        }
                    });
                }
                
                // context.succeed(data.Items);
                var response = {
                    statusCode: 200,
                    headers: {
                        "x-TxTracker-header" : "Schedule"
                    },
                    body: JSON.stringify(result)
                };
                context.succeed(response);
            })
            .catch(err => {
                console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
            });
        
    } else if (httpMethod == 'POST') {

        var jbody = JSON.parse(requestBody);
        
        var params = {
            TableName:"treatmenttracker-mobilehub-798355782-Schedule",
            Item: {
                "userId":jbody.userId,
                "clientId":jbody.clientId,
                "jobId":uuidv4(),
                "Date":jbody.Date,
                "Notes":jbody.Notes,
                "Hours":jbody.Hours,
                "StartTime":jbody.StartTime,
                "StopTime":jbody.StopTime,
                "EventName":jbody.EventName
            }
        };
        
        console.log(JSON.stringify(params));
        
        docClient.put(params).promise()
            .then(data => {
                console.log("put succeeded.");
                console.log("response: " + JSON.stringify(data))
                // context.succeed(data.Items);
                var response = {
                    statusCode: 200,
                    headers: {
                        "x-TxTracker-header" : "Schedule"
                    },
                    body: JSON.stringify(data)
                };
                context.succeed(response);
            })
            .catch(err => {
                console.log("Unable to put. Error:", JSON.stringify(err, null, 2));
            }); 
        
    } else if (httpMethod == 'PUT') {

        //update schedule
        var parsedBody = JSON.parse(requestBody);
        
        var params = {
            TableName:"treatmenttracker-mobilehub-798355782-Schedule",
            Key:{
                "userId":parsedBody.userId,
                "jobId":parsedBody.jobId
            },
            UpdateExpression: 'set #eventName = :eventName,  #date = :date, #hours = :hours, #starttime = :starttime, #stoptime = :stoptime, #clientId = :clientId, #notes = :notes',
            ExpressionAttributeNames: {'#eventName': 'EventName','#date': 'Date', '#hours': 'Hours', '#starttime' : 'StartTime', '#stoptime' : 'StopTime', '#clientId' : 'clientId', '#notes' : 'Notes'},
            ExpressionAttributeValues: {
                ':date' : parsedBody.Date,
                ':hours' : parsedBody.Hours,
                ':starttime' : parsedBody.StartTime,
                ':stoptime' : parsedBody.StopTime,
                ':clientId' : parsedBody.clientId,
                ':notes' : parsedBody.Notes,
                ':eventName' : parsedBody.EventName
            }
        };
        
        console.log(JSON.stringify(params, null, 2));
    
        docClient.update(params).promise()
            .then(data => {
                console.log("update succeeded.");
                console.log("response: " + JSON.stringify(data))
                // context.succeed(data.Items);
                var response = {
                    statusCode: 200,
                    headers: {
                        "x-TxTracker-header" : "Schedule"
                    },
                    body: JSON.stringify(data)
                };
                context.succeed(response);
            })
            .catch(err => {
                console.log("Unable to update. Error:", JSON.stringify(err, null, 2));
            });
        
    } else if (httpMethod == 'DELETE') {
        
        //delete item 
        var params = {
            TableName:"treatmenttracker-mobilehub-798355782-Schedule",
            Key:{
                "userId":cognitoIdentityId,
                "jobId":JSON.parse(requestBody).jobId
            }
        };

        console.log(JSON.stringify(params, null, 2));
    
        docClient.delete(params).promise()
            .then(data => {
                console.log("delete succeeded.");
                console.log("response: " + JSON.stringify(data))
                // context.succeed(data.Items);
                var response = {
                    statusCode: 200,
                    headers: {
                        "x-TxTracker-header" : "Schedule"
                    },
                    body: JSON.stringify(data)
                };
                context.succeed(response);
            })
            .catch(err => {
                console.log("Unable to delete. Error:", JSON.stringify(err, null, 2));
            });

    } else {
        // For demonstration purposes, we'll just echo these values back to the client
        var responseBody = {
            requestBody : requestBody,
            pathParams : pathParams,
            queryStringParams : queryStringParams,
            headerParams : headerParams,
            stage : stage,
            stageVariables : stageVariables,
            cognitoIdentityId : cognitoIdentityId,
            httpMethod : httpMethod,
            sourceIp : sourceIp,
            userAgent : userAgent,
            requestId : requestId,
            resourcePath : resourcePath
        };
    
        var response = {
            statusCode: responseCode,
            headers: {
                "x-custom-header" : "custom header value"
            },
            body: JSON.stringify(responseBody)
        };
        console.log("response: " + JSON.stringify(response))
        context.succeed(response);        
    }

};

if (require.main === module) {
    module.exports.handler(event, {succeed: (err, res) => console.log(err, res)}, {});
}