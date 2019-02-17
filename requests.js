function requestScheduleJSON(username, password) {
    // Setting up request parameters
    postURL = 'http://localhost:3000';
    body = {
        userName: username,
        passWord: password
    }

    // Setting up AJAX Parameters
    var settings = {
        "async": true,
        //"crossDomain": true,
        "url": postURL,
        "method": "POST",
        "data": JSON.stringify(body)
    }

    // Completing AJAX Request
    console.log("Starting Request");
    var request = $.ajax(settings).done(function (response) {
        console.log("Request Complete");
    });

    $.when(request).done(function (data) {
        console.log("Response Arrived");
        console.log(data);
    })
}