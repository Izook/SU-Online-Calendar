function requestScheduleJSON(username, password) {
    // Hiding submit button
    $("#submitHide").hide();

    // Displaying loading div
    $('.buttonLoading').show();


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

    // Setting up a 7 sec timeout response
    var requestTimeout = new Promise(function (resolve, reject) {
        setTimeout(resolve, 7000, "Timed Out");
    });

    // Completing AJAX Request
    console.log("Starting Request");
    request = $.ajax(settings).done(function (response) {
        console.log("Request Complete");
    });

    // Upon Response (or timout)
    Promise.race([request, requestTimeout]).then(function (data) {
        if (data == "Timed Out") {
            console.error("Request Timed Out");

            // Reveal submit button
            $("#submitHide").show();

            // Hiding loading div
            $('.buttonLoading').hide();

            // Show login error
            $('.errorResponse').show();
        }
        else {
            console.log("Response Arrived");
            console.log(data);

            // Begin calendar population

            // Hide login Page
            $("#login-title").hide();
            $("#login-page").hide();

            // Show calendar page
            $("#calendar-title").show();
            $("#schedule-page").show();
        }
    });
}