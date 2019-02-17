$(document).ready(function () {
  $("#submitHide").unbind('click');
  $("#submitHide").on('click', function() {
    var username = $("#userNameInput").val();
    var password = $("#passWordInput").val();
    requestScheduleJSON(username,password);
  });
})

function changeColor(cell) {
  var i;
  for (i = 0; i < cell.length; i++) {
    cell[i].style.color = '#EF4135'
    //BLUE #088099
    //GREEN #55B31B
    //YELLOW #FDB913
    //NAVY #003282
  }
}

function showSchedule() {

}
