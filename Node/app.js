// NPM Packages
var http = require('http');
const phantom = require('phantom');
const cheerio = require('cheerio');

// Test Variables
const testScheduleHTML = '<td><div class="vertical"><table class="layout" summary="This panel contains controls that are vertically  aligned."><tbody><tr><td class="component text label readonly "><label id="LABELID_VAR2" class="hidden" for="VAR2"></label></td><td class="control left"><div><p id="VAR2">2267127 Isaac Ortega</p><label class="hidden" for="VAR2"></label><input type="hidden" name="VAR2" value="2267127 Isaac Ortega"></div></td></tr><tr><td colspan="2"><div class="envisionWindow" id="GROUP_Grp_LIST_VAR11"><input type="hidden" value="LIST.VAR11" name="LIST.VAR11_CONTROLLER"><input type="hidden" value="LIST.VAR11" name="LIST.VAR11_MEMBERS"><table summary="Term"><tbody><tr><th class="groupTitle" colspan="1">Term</th></tr><tr></td>';

// Test Function
//parseScheduleHTMLtoJSON(testScheduleHTML);

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
        getPhantomBrowsedCalendarHTML("ortegai", "OrangutanCanteloupe");
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

                    // Confirm two mandatory parameters exist 
                    if (queryData.userName != null && queryData.passWord != null) {
                        var username = queryData.userName;
                        var password = queryData.passWord;

                        console.log("RESPONSE: 0");
                        console.log(res);

                        try {
                            getPhantomBrowsedCalendarHTML(res, "ortegai", "OrangutanCanteloupe");
                        }
                        catch (err) {
                            // Create and return error JSON response
                            var errorJSON = {
                                status: "Error Browsing Occured",
                            }
                            response.writeHead(300, { 'Content-Type': 'text/json' });
                            response.end(JSON.stringify(errorJSON));
                        }
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


// Uses PhantomJS headless browser to go to SU Online and access the 
// user's schedule (returned as HTML). Parsing done using cheerio HTML parser. 
async function getPhantomBrowsedCalendarHTML(username, password) {

    // SU Online URL
    var url = "https://webadvisor.seattleu.edu/";

    // Instantiating phantom instance and page
    const instance = await phantom.create();
    const page = await instance.createPage();

    // Resource count to determine how long to wait until render
    var resourceCount = 0;

    // Timeouts to begin upon sufficient resources loaded
    var renderTimeout;
    var maxRendertimeout;

    // Time to wait for resources to load
    var resourceWait = 800;
    var maxRenderWait = 5000;

    // Marker of current step in crawl process
    var step = 1;

    // Function to login once all login resources have occurred
    async function nextStep() {
        console.log("Finding Step: " + step);
        switch (step) {
            case 1:
                goToLogin();
                break;
            case 2:
                login();
                break;
            case 3:
                goToStudentMenu();
                break;
            case 4:
                goToScheduleForm();
                break;
            case 5:
                goToSchedule();
                break;
            case 6:
                getScheduleHTML();
                break;
            default:
                console.log("All Steps Completed!");
                break
        }
    }

    // Function to go to login page
    async function goToLogin() {
        var title = await page.property('title');
        console.log("Step 1: Current Page On [" + title + "]");

        // Going to next step
        if (step < 2)
            step = 2;

        // Logging Place
        console.log("> Going To Login");

        // Clicking Login Link
        await page.evaluate(function () {
            console.log("Going to Login");
            document.getElementById("acctLogin").children[0].click();
        }).then(function (html) {
            // Begin Next Step (after some delay)
            setTimeout(nextStep, resourceWait);
        });
    }

    // Function to login 
    async function login() {
        var title = await page.property('title');
        console.log("Step 2: Current Page On [" + title + "]");
        if (title == "Log In") {
            // Going to next step
            if (step < 3)
                step = 3;

            // Logging Place
            console.log("> Logging In");

            // Logging In
            await page.evaluate(function (userName, passWord) {
                console.log("Logging In");
                document.getElementById("USER_NAME").value = userName;
                document.getElementById("CURR_PWD").value = passWord;
                document.getElementsByClassName("submit")[0].children[0].click();
            }, username, password).then(function (html) {
                // Begin Next Step (after some delay)
                setTimeout(nextStep, resourceWait);
            });
        }
    }

    // Function to go to student menu
    async function goToStudentMenu() {
        var title = await page.property('title');
        console.log("Step 3: Current Page On [" + title + "]");
        if (title == "WebAdvisor Main Menu") {
            // Going to next step
            if (step < 4)
                step = 4;

            // Logging Place
            console.log("> Going To Student Menu");

            // Clicking Student Menu Link
            await page.evaluate(function () {
                console.log("Going to Student Menu");
                document.getElementById("mainMenu").children[0].click();
            }).then(function (html) {
                // Begin Next Step (after some delay)
                setTimeout(nextStep, resourceWait);
            });
        }
    }

    // Function to travel to schedule form
    async function goToScheduleForm() {
        var title = await page.property('title');
        console.log("Step 4: Current Page On [" + title + "]");
        if (title == "WebAdvisor for Students") {
            // Going to next step
            if (step < 5)
                step = 5;

            // Logging Place
            console.log("> Going To Schedule Form");

            // Clicking Schedule Link
            await page.evaluate(function () {
                console.log("Going to Schedule Form");
                console.log(document.body.innerHTML);
                document.getElementsByClassName("left")[0].children[5].children[4].children[0].click();
                console.log("Click Confirmed");
            }).then(function (html) {
                // Begin Next Step (after some delay)
                setTimeout(nextStep, resourceWait);
            });

        }
    }

    // Function to travel to schedule form
    async function goToSchedule() {
        var title = await page.property('title');
        console.log("Step5: Current Page On [" + title + "]");
        if (title == "View Class Schedule") {
            // Going to next step
            if (step < 6)
                step = 6;

            // Logging Place
            console.log("> Going To Schedule");

            // Clicking Filling Schedule Form
            await page.evaluate(function () {
                console.log("Going to Schedule");
                document.getElementById("VAR4").value = '19SQ';
                document.getElementsByClassName('shortButton')[0].click()
            }).then(function (html) {
                // Begin Next Step (after some delay)
                setTimeout(nextStep, resourceWait);
            });
        }
    }

    // Function to get schedule HTML
    async function getScheduleHTML() {
        var title = await page.property('title');
        console.log("Step 6: Current Page On [" + title + "]");
        if (title == "Schedule") {

            // Logging Place
            console.log("> Getting Schedule HTML");

            // Getting HtML
            await page.evaluate(function () {
                console.log("Getting Schedule HTML");
                return document.body.innerHTML;
            }).then(function (html) {
                console.log("Schedule Page HTML:");

                // Confirming schedule is completely loaded
                if (isScheduleLoaded(html)) {
                    // Go to next step
                    step = 7;

                    // Parse HTML
                    parseScheduleHTMLtoJSON(html);
                }
                // Begin Next Step (after some delay)
                setTimeout(nextStep, resourceWait);
            });

        }
    }

    // Callback for every resource requested
    await page.on("onResourceRequested", function (requestData) {
        resourceCount++;
        console.info("========= Resource Requested: " + resourceCount);
    });

    // Callback for every resource recieved
    page.on("onResourceReceived", function (response) {
        if (!response.stage || response.stage === 'end') {
            resourceCount--;
            console.info("========= Resource Recieved: " + resourceCount);
            if (resourceCount === 0) {
                console.log("===================== Resource Timeout Enabled");
                renderTimeout = setTimeout(function () {
                    console.log("========================== Resource Timeout Finished");
                    nextStep();
                }, resourceWait);
            }
        }
    });

    // Callback for every resource recieved
    await page.on("onConsoleMessage", function (message) {
        console.info('>>>' + message + '<<<');
    });

    // Open SU Online Page
    page.open(url).then(async function (status) {
        // If open failed exit
        if (status !== "success") {
            console.error('Unable to load url');
            instance.exit();
        } else {
            console.log("===================== Max Timeout Enabled")
            maxRendertimeout = setTimeout(function () {
                console.log("=========================== Max Timeout Finsished")
                console.log("=========================== Reources Left: " + resourceCount);
                nextStep();
            }, maxRenderWait);
        }
    });


}

// Same as above function but this takes the http response object to respond to the request
async function getPhantomBrowsedCalendarHTML(response, username, password) {

    // SU Online URL
    var url = "https://webadvisor.seattleu.edu/";

    // Instantiating phantom instance and page
    const instance = await phantom.create();
    const page = await instance.createPage();

    // Resource count to determine how long to wait until render
    var resourceCount = 0;

    // Timeouts to begin upon sufficient resources loaded
    var renderTimeout;
    var maxRendertimeout;

    // Time to wait for resources to load
    var resourceWait = 800;
    var maxRenderWait = 5000;

    // Marker of current step in crawl process
    var step = 1;

    // Function to login once all login resources have occurred
    async function nextStep() {
        console.log("Finding Step: " + step);
        switch (step) {
            case 1:
                goToLogin();
                break;
            case 2:
                login();
                break;
            case 3:
                goToStudentMenu();
                break;
            case 4:
                goToScheduleForm();
                break;
            case 5:
                goToSchedule();
                break;
            case 6:
                getScheduleHTML();
                break;
            default:
                console.log("All Steps Completed!");
                break
        }
    }

    // Function to go to login page
    async function goToLogin() {
        var title = await page.property('title');
        console.log("Step 1: Current Page On [" + title + "]");

        // Going to next step
        if (step < 2)
            step = 2;

        // Logging Place
        console.log("> Going To Login");

        // Clicking Login Link
        await page.evaluate(function () {
            console.log("Going to Login");
            document.getElementById("acctLogin").children[0].click();
        }).then(function (html) {
            // Begin Next Step (after some delay)
            setTimeout(nextStep, resourceWait);
        });
    }

    // Function to login 
    async function login() {
        var title = await page.property('title');
        console.log("Step 2: Current Page On [" + title + "]");
        if (title == "Log In") {
            // Going to next step
            if (step < 3)
                step = 3;

            // Logging Place
            console.log("> Logging In");

            // Logging In
            await page.evaluate(function (userName, passWord) {
                console.log("Logging In");
                document.getElementById("USER_NAME").value = userName;
                document.getElementById("CURR_PWD").value = passWord;
                document.getElementsByClassName("submit")[0].children[0].click();
            }, username, password).then(function (html) {
                // Begin Next Step (after some delay)
                setTimeout(nextStep, resourceWait);
            });
        }
    }

    // Function to go to student menu
    async function goToStudentMenu() {
        var title = await page.property('title');
        console.log("Step 3: Current Page On [" + title + "]");
        if (title == "WebAdvisor Main Menu") {
            // Going to next step
            if (step < 4)
                step = 4;

            // Logging Place
            console.log("> Going To Student Menu");

            // Clicking Student Menu Link
            await page.evaluate(function () {
                console.log("Going to Student Menu");
                document.getElementById("mainMenu").children[0].click();
            }).then(function (html) {
                // Begin Next Step (after some delay)
                setTimeout(nextStep, resourceWait);
            });
        }
    }

    // Function to travel to schedule form
    async function goToScheduleForm() {
        var title = await page.property('title');
        console.log("Step 4: Current Page On [" + title + "]");
        if (title == "WebAdvisor for Students") {
            // Going to next step
            if (step < 5)
                step = 5;

            // Logging Place
            console.log("> Going To Schedule Form");

            // Clicking Schedule Link
            await page.evaluate(function () {
                console.log("Going to Schedule Form");
                console.log(document.body.innerHTML);
                document.getElementsByClassName("left")[0].children[5].children[4].children[0].click();
                console.log("Click Confirmed");
            }).then(function (html) {
                // Begin Next Step (after some delay)
                setTimeout(nextStep, resourceWait);
            });

        }
    }

    // Function to travel to schedule form
    async function goToSchedule() {
        var title = await page.property('title');
        console.log("Step5: Current Page On [" + title + "]");
        if (title == "View Class Schedule") {
            // Going to next step
            if (step < 6)
                step = 6;

            // Logging Place
            console.log("> Going To Schedule");

            // Clicking Filling Schedule Form
            await page.evaluate(function () {
                console.log("Going to Schedule");
                document.getElementById("VAR4").value = '19SQ';
                document.getElementsByClassName('shortButton')[0].click()
            }).then(function (html) {
                // Begin Next Step (after some delay)
                setTimeout(nextStep, resourceWait);
            });
        }
    }

    // Function to get schedule HTML
    async function getScheduleHTML() {

        console.log("RESPONSE: 2");
        console.log(response);

        var title = await page.property('title');
        console.log("Step 6: Current Page On [" + title + "]");
        if (title == "Schedule") {

            // Logging Place
            console.log("> Getting Schedule HTML");

            // Getting HtML
            await page.evaluate(function () {
                console.log("Getting Schedule HTML");
                return document.body.innerHTML;
            }).then(function (html) {
                console.log("Schedule Page HTML:");

                // Confirming schedule is completely loaded
                if (isScheduleLoaded(html)) {
                    // Go to next step
                    step = 7;

                    console.log("RESPONSE: 3");
                    console.log(response);

                    // Parse HTML
                    parseScheduleHTMLtoJSON(response, html);
                }
                // Begin Next Step (after some delay)
                setTimeout(nextStep, resourceWait);
            });

        }
    }

    // Callback for every resource requested
    await page.on("onResourceRequested", function (requestData) {
        resourceCount++;
        console.info("========= Resource Requested: " + resourceCount);
    });

    // Callback for every resource recieved
    page.on("onResourceReceived", function (response) {
        if (!response.stage || response.stage === 'end') {
            resourceCount--;
            console.info("========= Resource Recieved: " + resourceCount);
            if (resourceCount === 0) {
                console.log("===================== Resource Timeout Enabled");
                renderTimeout = setTimeout(function () {
                    console.log("========================== Resource Timeout Finished");
                    nextStep();
                }, resourceWait);
            }
        }
    });

    // Callback for every resource recieved
    await page.on("onConsoleMessage", function (message) {
        console.info('>>>' + message + '<<<');
    });

    // Open SU Online Page
    page.open(url).then(async function (status) {
        // If open failed exit
        if (status !== "success") {
            console.error('Unable to load url');
            instance.exit();
        } else {
            console.log("===================== Max Timeout Enabled")
            maxRendertimeout = setTimeout(function () {
                console.log("=========================== Max Timeout Finsished")
                console.log("=========================== Reources Left: " + resourceCount);
                nextStep();
            }, maxRenderWait);
        }
    });


}

// Checks body HTML to determine if schedule table is fully loaded. True if so,
// false if not. (Looks for 'OK' button at bottom to be loaded.);
function isScheduleLoaded(html) {
    console.log("Checking Schedule HTML");

    // Try - Catch Parsing Process
    try {
        // Loading HTML into Cheerio
        const $ = cheerio.load(html);

        // Check if button is there
        if ($('.submit.OK .shortButton') != null) {
            console.log("Button Found");
            return true;
        }
        else {
            console.log("Button Not Found");
            return false;
        }
    }
    catch (err) {
        console.error("HTML Checking Error Occured: ");
        console.error(err);
        return false;
    }
}

// Uses cheerio to parse HTML and convert it into a readable JSON format for
// the JSON to ICS converter to work
function parseScheduleHTMLtoJSON(scheduleHTML) {
    console.log("Parsing Starting:");

    // Try - Catch Parsing Process
    try {
        // Loading HTML into Cheerio
        const $ = cheerio.load(scheduleHTML);

        // Getting User Name and ID
        var nameID = $("#VAR2").html();
        var name = nameID.replace(/\d/g, '').trim();
        var ID = nameID.substring(0, (nameID.length - name.length)).trim();

        // Instantiating raw course data array
        var coursesRawData = [];

        // Iterating through each row in schedule get raw course data
        $('table[summary="Schedule"] tbody tr').each(function (index, element) {
            // Checking that row contains a course title
            if ($(element).find('.LIST_VAR6 div a').html() != null) {
                console.log("Parsing Row: " + index);

                // Creating Course Object
                var course = {};

                // Populating Course
                course.courseTitle = $(element).find('.LIST_VAR6 div a').html();
                course.status = $(element).find('.LIST_VAR10 div p').html();
                course.meetingInfo = $(element).find('.LIST_VAR12 div p').html();
                course.sectionTitle = $(element).find('.LIST_VAR19 div p').html();
                course.credits = $(element).find('.LIST_VAR8 div p').html();
                course.passAud = $(element).find('.LIST_VAR7 div p').html();
                course.startDate = $(element).find('.DATE_LIST_VAR1 div p').html();

                // Adding course to JSON
                coursesRawData.push(course);
            }
            else {
                console.log("Skipping Header [" + index + "]");
            }
        });

        // Instatiating new formatted course data array
        var courses = [];

        // Reformating raw course data
        coursesRawData.forEach(function (rawCourse) {
            // Instatiating course object
            var course = {};

            // Formatting Regular Expressions
            var codeRegEx = /[A-Z]{4}-[0-9]{4}(-[0-9]{2})+/g;
            var endDateRegEx = /-([0-9]{2}\/[0-9]{2}\/[0-9]{2})/g;
            var startTimeRegEx = /[0-9]{2}:[0-9]{2}(AM|PM)/g;
            var endTimeRegEx = /-[0-9]{2}:[0-9]{2}(AM|PM)/g;
            var buildingCodeRegEx = /[A-Z]{4}/g;
            var roomRegEx = /RM [0-9]{3,}/g
            var instructorRegEx = /, ([A-Z]{4}), (RM [0-9]{3,}) ([\w. ]+)/g;


            // Getting raw course meeting info
            var meetingInfo = rawCourse.meetingInfo;

            // Getting Course Code and Title
            course.code = codeRegEx.exec(rawCourse.courseTitle)[0];
            course.title = rawCourse.courseTitle.substring(course.code.legth);

            // Getting End Date
            console.log(meetingInfo);
            course.endDate = endDateRegEx.exec(meetingInfo)[0].substring(1);

            // Getting Days
            course.onMonday = meetingInfo.includes("Monday");
            course.onTuesday = meetingInfo.includes("Tuesday");
            course.onWednesday = meetingInfo.includes("Wednesday");
            course.onThursday = meetingInfo.includes("Thursday");
            course.onFriday = meetingInfo.includes("Friday");

            // Getting Start & End Times
            course.startTime = startTimeRegEx.exec(meetingInfo)[0];
            course.endTime = endTimeRegEx.exec(meetingInfo)[0].substring(2);

            // Getting Location and Instructor
            var indexPastEndTime = meetingInfo.indexOf(course.endTime) + course.endTime.length;
            var locationInstructor = meetingInfo.substring(indexPastEndTime);
            course.buildingCode = buildingCodeRegEx.exec(locationInstructor)[0];
            course.roomNum = roomRegEx.exec(locationInstructor)[0];
            var instructorMatches = instructorRegEx.exec(locationInstructor);
            course.instructor = (instructorMatches == null) ? '' : instructorMatches[3];

            // Pushing new course into courses array
            courses.push(course);
        });

        // Creating and Logging Schedule JSON
        var scheduleJSON = {
            status: "SUCCESS",
            name: name,
            ID: ID,
            courses: courses
        }
        console.log(scheduleJSON);

        return scheduleJSON;
    }
    catch (err) {
        // Log Error
        console.error("HTML Parsing Error Occured: ");
        console.error(err);

        // Create and return error JSON response
        var errorJSON = {
            status: "Parsing Error",
        }
        return errorJSON;
    }

}

// Same as the above function but this takes the http response object to respond to the request
function parseScheduleHTMLtoJSON(response, scheduleHTML) {
    console.log("RESPONSE: 4");
    console.log(response);

    console.log("Parsing Starting:");
    // Try - Catch Parsing Process
    try {
        // Loading HTML into Cheerio
        const $ = cheerio.load(scheduleHTML);

        // Getting User Name and ID
        var nameID = $("#VAR2").html();
        var name = nameID.replace(/\d/g, '').trim();
        var ID = nameID.substring(0, (nameID.length - name.length)).trim();

        // Instantiating raw course data array
        var coursesRawData = [];

        // Iterating through each row in schedule get raw course data
        $('table[summary="Schedule"] tbody tr').each(function (index, element) {
            // Checking that row contains a course title
            if ($(element).find('.LIST_VAR6 div a').html() != null) {
                console.log("Parsing Row: " + index);

                // Creating Course Object
                var course = {};

                // Populating Course
                course.courseTitle = $(element).find('.LIST_VAR6 div a').html();
                course.status = $(element).find('.LIST_VAR10 div p').html();
                course.meetingInfo = $(element).find('.LIST_VAR12 div p').html();
                course.sectionTitle = $(element).find('.LIST_VAR19 div p').html();
                course.credits = $(element).find('.LIST_VAR8 div p').html();
                course.passAud = $(element).find('.LIST_VAR7 div p').html();
                course.startDate = $(element).find('.DATE_LIST_VAR1 div p').html();

                // Adding course to JSON
                coursesRawData.push(course);
            }
            else {
                console.log("Skipping Header [" + index + "]");
            }
        });

        // Instatiating new formatted course data array
        var courses = [];

        // Reformating raw course data
        coursesRawData.forEach(function (rawCourse) {
            // Instatiating course object
            var course = {};

            // Formatting Regular Expressions
            var codeRegEx = /[A-Z]{4}-[0-9]{4}(-[0-9]{2})+/g;
            var endDateRegEx = /-([0-9]{2}\/[0-9]{2}\/[0-9]{2})/g;
            var startTimeRegEx = /[0-9]{2}:[0-9]{2}(AM|PM)/g;
            var endTimeRegEx = /-[0-9]{2}:[0-9]{2}(AM|PM)/g;
            var buildingCodeRegEx = /[A-Z]{4}/g;
            var roomRegEx = /RM [0-9]{3,}/g
            var instructorRegEx = /, ([A-Z]{4}), (RM [0-9]{3,}) ([\w. ]+)/g;


            // Getting raw course meeting info
            var meetingInfo = rawCourse.meetingInfo;

            // Getting Course Code and Title
            course.code = codeRegEx.exec(rawCourse.courseTitle)[0];
            course.title = rawCourse.courseTitle.substring(course.code.legth);

            // Getting End Date
            console.log(meetingInfo);
            course.endDate = endDateRegEx.exec(meetingInfo)[0].substring(1);

            // Getting Days
            course.onMonday = meetingInfo.includes("Monday");
            course.onTuesday = meetingInfo.includes("Tuesday");
            course.onWednesday = meetingInfo.includes("Wednesday");
            course.onThursday = meetingInfo.includes("Thursday");
            course.onFriday = meetingInfo.includes("Friday");

            // Getting Start & End Times
            course.startTime = startTimeRegEx.exec(meetingInfo)[0];
            course.endTime = endTimeRegEx.exec(meetingInfo)[0].substring(2);

            // Getting Location and Instructor
            var indexPastEndTime = meetingInfo.indexOf(course.endTime) + course.endTime.length;
            var locationInstructor = meetingInfo.substring(indexPastEndTime);
            course.buildingCode = buildingCodeRegEx.exec(locationInstructor)[0];
            course.roomNum = roomRegEx.exec(locationInstructor)[0];
            var instructorMatches = instructorRegEx.exec(locationInstructor);
            course.instructor = (instructorMatches == null) ? '' : instructorMatches[3];

            // Pushing new course into courses array
            courses.push(course);
        });

        // Creating and Logging Schedule JSON
        var scheduleJSON = {
            status: "SUCCESS",
            name: name,
            ID: ID,
            courses: courses
        }
        console.log(scheduleJSON);

        response.writeHead(200, { 'Content-Type': 'text/json' });
        response.end(JSON.stringify(scheduleJSON));
    }
    catch (err) {
        // Log Error
        console.error("HTML Parsing Error Occured: ");
        console.error(err);

        // Create and return error JSON response
        var errorJSON = {
            status: "Parsing Error",
        }
        response.writeHead(300, { 'Content-Type': 'text/json' });
        response.end(JSON.stringify(errorJSON));
    }

}

// Uses user schedule JSON and uses Microsoft Outlooks API to create easy to add
// Outlook calendar links.  [NOT YET IMPLEMENTED]
function getCalendarLinks(scheduleJSON) {

}
