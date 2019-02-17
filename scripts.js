function getLogin() {
  var username = document.getElementById('text').type
  var pass = document.getElementById('password').type
  //do some stuff
}

//TODO how to hide and show?
function switchView() {
  $("#submit").click(function() {
    $("login-title").hide();
    $("login-page").hide();
    $("calendar-title").show();
    $("schedule-page").show();
  });
}

function showSchedule() {
  var x = document.getElementById('quarters').value
}
