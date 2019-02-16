var http = require('http');
var querystring = require('querystring');
const phantom = require('phantom');
const cheerio = require('cheerio');

// Instantiates test server and has it listen to port 8080
// If GET request echos url
// If POST request responds with test JSON
var testPostServer = http.createServer(function (req, res) {
    if (req.method == 'POST') {
        console.log("POST");
        req.on('data', function (data) {
            console.log(data);
            //body += data;
        });
        req.on('end', function () {
            console.log("This is RUNNING");
            //console.log("Body: " + body);
        });
        res.writeHead(200, { 'Content-Type': 'text/json' });
        var responseJson = {
            string: "string",
            int: 1,
            boolean: true
        }
        res.end(JSON.stringify(responseJson));
    }
    else {
        console.log("GET");
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write("Please make POST call with data instead!");
        res.write(req.url);
        res.end();
    }
    
});
testPostServer.listen(8080);

// Initiates request server to return JSON of schedule from SUOnline
// Requires data to have Username, Password, optionally Quarter 
// Body must be in the json form {
//                                  "userName": [USERNAME],
//                                  "passWord": [PASSWORD]
//                               }
// If GET responds with error
var getScheduleJSONServer = http.createServer(function (req, res) {
    if (req.method == 'POST') {
        console.log("POST");
        try {
            // Accumulate POST body
            var body = '';
            req.on('data', function (data) {
                body += data.toString();
                
                // If data overload attempt
                if (body.length > 1e6) {
                    body = "";
                    response.writeHead(413, { 'Content-Type': 'text/plain' }).end();
                    request.connection.destroy();
                }
            });

            // Upon requiring all POST data
            req.on('end', function () {
                try {
                    // Convert body to JSON
                    var queryData = JSON.parse(body);
                    console.log(queryData);

                    // Confirm two mandatory parameters exist 
                    if (queryData.userName != null && queryData.passWord != null) {

                        // Phantom Browse to SU Online

                        // Generate and Cache Outlook Calendar API Link(s)

                        res.writeHead(200, { 'Content-Type': 'text/json' });
                        var responseJson = {
                            userName: queryData.userName,
                            passWord: queryData.passWord
                        };
                        res.end(JSON.stringify(responseJson));
                    }
                    else {
                        console.error("Inadequeate JSON Error:");
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.write("JSON Inadequate.");
                        res.end();
                    }
                }
                catch (err) {
                    console.error("Parsing Error Occured:");
                    console.error(err);
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.write("Error occurred during data parsing.");
                    res.end();
                }
            });

            // Upon request error
            req.on('error', function () {
                console.error("Request Error Occured:");
                console.error(err);
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.write("Error occurred during request.");
                res.end();
            })
        }
        catch (err) {
            console.error("Error Occured:");
            console.error(err);
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.write("Error occurred during request creation.");
            res.end();
        }
        
    }
    else {
        console.log("GET");
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.write("Please make POST call!");
        res.end();
    }

});
getScheduleJSONServer.listen(3000);